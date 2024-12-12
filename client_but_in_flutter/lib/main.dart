import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: AnimationScreen(),
    );
  }
}

class AnimationScreen extends StatefulWidget {
  const AnimationScreen({super.key});

  @override
  _AnimationScreenState createState() => _AnimationScreenState();
}

class _AnimationScreenState extends State<AnimationScreen>
    with WidgetsBindingObserver {
  WebSocketChannel? _channel;
  // rethink abou this mallon tha allaksoun i that paroun mpoulo
  double trainPosition = 0.0;
  double screenWidth = 0.0;
  double virtualScreenWidth = 0.0;
  double trainWidth = 400.0;
  double wagonWidth = 80.0;
  int numberOfWagons = 4;
  double engineWidth = 100.0;
  int instanceIndex = 0;
  bool isConnected = false;
  Timer? _reconnectTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _connectWebSocket();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _reconnectTimer?.cancel();
    _channel?.sink.close();
    super.dispose();
  }

  void _connectWebSocket() {
    setState(() {
      isConnected = false;
    });

    try {
      _channel = WebSocketChannel.connect(
        Uri.parse('ws://localhost:8088'),
      );

      setState(() {
        isConnected = true;
      });

      WidgetsBinding.instance.addPostFrameCallback((_) {
        _sendScreenWidth();
      });

      _channel!.stream.listen(
        (message) {
          final decodedMessage = json.decode(message);

          if (decodedMessage['event'] == 'UPDATE_POSITION') {
            setState(() {
              trainPosition =
                  (decodedMessage['trainPosition'] as int).toDouble();
              virtualScreenWidth =
                  (decodedMessage['virtualScreenWidth'] as int).toDouble();
              trainWidth = (decodedMessage['trainWidth'] as int).toDouble();
              wagonWidth = (decodedMessage['wagonWidth'] as int).toDouble();
              engineWidth = (decodedMessage['engineWidth'] as int).toDouble();
              numberOfWagons = (decodedMessage['numberOfWagons'] as int);
              instanceIndex = decodedMessage['instanceIndex'];
            });
          }
        },
        onDone: _handleDisconnection,
        onError: (error) {
          print('WebSocket error: $error');
          _handleDisconnection();
        },
      );
      _reconnectTimer?.cancel();
      _reconnectTimer = null;
    } catch (error) {
      print('WebSocket connection fucked: $error');
      _handleDisconnection();
    }
  }

  // tsekare to ksana
  void _handleDisconnection() {
    if (_reconnectTimer == null || !_reconnectTimer!.isActive) {
      print('Attempting to refuckonnect...');
      _reconnectTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
        print('Reconnecting...');
        _connectWebSocket();
      });
    }
  }

  void _sendScreenWidth() {
    if (_channel != null && isConnected) {
      Future.microtask(() {
        setState(() {
          screenWidth = MediaQuery.of(context).size.width;
        });

        _channel?.sink.add(json.encode({
          'event': 'UPDATE_SCREEN_WIDTH',
          'screenWidth': screenWidth.toInt(),
        }));
      });
    }
  }

  @override
  void didChangeMetrics() {
    super.didChangeMetrics();
    _sendScreenWidth();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final updatedWidth = constraints.maxWidth;
        if (updatedWidth != screenWidth) {
          screenWidth = updatedWidth;
          _sendScreenWidth();
        }
        double localPosition = adjustedLocalPosition();

        bool isTrainVisible =
            localPosition + trainWidth > 0 && localPosition < screenWidth;

        return Scaffold(
          body: Stack(
            children: [
              Positioned.fill(
                child: Image.asset(
                  'assets/road.png',
                  fit: BoxFit.cover,
                ),
              ),
              if (isTrainVisible)
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 1000 ~/ 40),
                  left: localPosition,
                  top: MediaQuery.of(context).size.height / 2 - 50,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      ...List.generate(
                          numberOfWagons.toInt(),
                          (index) => Column(
                                children: [
                                  Image.asset(
                                    'assets/wagon.png',
                                    width: wagonWidth,
                                    // height: 140,
                                  ),
                                ],
                              )),
                      Image.asset(
                        'assets/train_engine.png',
                        width: engineWidth,
                      ),
                    ],
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  // optimize this shit sometime
  double adjustedLocalPosition() {
    double offset = 0.0;

    for (int i = 0; i < instanceIndex; i++) {
      offset += screenWidth;
    }

    double relativePosition = trainPosition - offset;

    if (relativePosition < -trainWidth) {
      relativePosition += virtualScreenWidth + trainWidth;
    }

    if (instanceIndex == 0 &&
        screenWidth != virtualScreenWidth &&
        (trainPosition + trainWidth) > virtualScreenWidth) {
      relativePosition = -(virtualScreenWidth - trainPosition);
    }

    return relativePosition;
  }
}
