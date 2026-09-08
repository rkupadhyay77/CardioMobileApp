import React, {Component} from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import styles, {FLOATING_WINDOW_HEIGHT} from './styles';
import Icon from 'react-native-vector-icons/AntDesign';
import IconFeather from 'react-native-vector-icons/Feather';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import getStateItem from '../../../state/getStateItem';
import {DB_KEY} from '../../../common/helper/keys';
import ThemeChange from '../../../state/emitters/themeChange';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const SAFE_TOP = Platform.OS === 'ios' ? 44 : 24;
const SAFE_BOTTOM = Platform.OS === 'ios' ? 34 : 24;
const MINIMIZED_HEIGHT = 54;

export default class FloatingWindow extends Component {
  constructor(props) {
    super(props);

    const initialY =
      props.initialY !== undefined ? props.initialY : SAFE_TOP + 10;
    this.pan = new Animated.ValueXY({x: 0, y: initialY});
    this.heightAnim = new Animated.Value(FLOATING_WINDOW_HEIGHT);

    this.currentX = 0;
    this.currentY = initialY;

    this.state = {
      isMinimized: false,
      isDarkMode: getStateItem(DB_KEY.IS_DARK_MODE) || false,
    };

    // Keep internal track of current position
    this.pan.addListener(value => {
      this.currentX = value.x;
      this.currentY = value.y;
    });

    this.initPanResponder();
    this.themeChangeListener = this.themeChangeListener.bind(this);
  }

  componentDidMount() {
    ThemeChange.addThemeChangeListener(this.themeChangeListener);
  }

  componentWillUnmount() {
    ThemeChange.removeThemeChangeListener(this.themeChangeListener);
    this.pan.removeAllListeners();
  }

  themeChangeListener() {
    const isDark = getStateItem(DB_KEY.IS_DARK_MODE) || false;
    this.setState({isDarkMode: isDark});
  }

  initPanResponder() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only claim responder if dragged more than 3 pixels
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        this.pan.setOffset({
          x: this.currentX,
          y: this.currentY,
        });
        this.pan.setValue({x: 0, y: 0});
      },
      onPanResponderMove: Animated.event(
        [null, {dx: this.pan.x, dy: this.pan.y}],
        {useNativeDriver: false},
      ),
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: () => {
        this.pan.flattenOffset();
        this.clampPosition();
      },
      onPanResponderTerminate: () => {
        this.pan.flattenOffset();
        this.clampPosition();
      },
      onShouldBlockNativeResponder: () => true,
    });
  }

  clampPosition() {
    const currentWindowHeight = this.state.isMinimized
      ? MINIMIZED_HEIGHT
      : FLOATING_WINDOW_HEIGHT;

    const minY = SAFE_TOP;
    const maxY = SCREEN_HEIGHT - currentWindowHeight - SAFE_BOTTOM;

    let targetY = this.currentY;
    if (targetY < minY) {
      targetY = minY;
    } else if (targetY > maxY) {
      targetY = maxY;
    }

    // Always keep X centered (0) since width is full screen width
    Animated.spring(this.pan, {
      toValue: {x: 0, y: targetY},
      friction: 7,
      tension: 40,
      useNativeDriver: false,
    }).start(() => {
      this.currentX = 0;
      this.currentY = targetY;
    });
  }

  toggleMinimize() {
    const nextMinimized = !this.state.isMinimized;
    const targetHeight = nextMinimized
      ? MINIMIZED_HEIGHT
      : FLOATING_WINDOW_HEIGHT;

    this.setState({isMinimized: nextMinimized}, () => {
      Animated.spring(this.heightAnim, {
        toValue: targetHeight,
        friction: 8,
        tension: 40,
        useNativeDriver: false,
      }).start(() => {
        this.clampPosition();
      });
    });
  }

  handleClose() {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  renderDefaultContent() {
    const {isDarkMode} = this.state;
    const textColor = isDarkMode ? '#EEEEEE' : '#222222';
    const subTextColor = isDarkMode ? '#AAAAAA' : '#666666';

    return (
      <View style={styles.defaultContentContainer}>
        <Text style={[styles.defaultContentTitle, {color: textColor}]}>
          Cardio Live Overview
        </Text>
        <Text style={[styles.defaultContentSubtitle, {color: subTextColor}]}>
          Drag anywhere from the handle bar to reposition this window.
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <IconFontAwesome name="heartbeat" size={20} color="#E53935" />
            <Text style={[styles.statNumber, {color: textColor}]}>72</Text>
            <Text style={styles.statLabel}>BPM</Text>
          </View>
          <View style={styles.statBox}>
            <IconFontAwesome name="stethoscope" size={20} color="#1E88E5" />
            <Text style={[styles.statNumber, {color: textColor}]}>16</Text>
            <Text style={styles.statLabel}>RESP/MIN</Text>
          </View>
          <View style={styles.statBox}>
            <IconFontAwesome
              name="thermometer-half"
              size={20}
              color="#FB8C00"
            />
            <Text style={[styles.statNumber, {color: textColor}]}>98.6°F</Text>
            <Text style={styles.statLabel}>TEMP</Text>
          </View>
        </View>
      </View>
    );
  }

  render() {
    const {
      visible = true,
      title = 'Cardio Floating Monitor',
      children,
    } = this.props;
    const {isMinimized, isDarkMode} = this.state;

    if (!visible) {
      return null;
    }

    const cardThemeStyle = isDarkMode ? styles.cardDark : styles.cardLight;
    const titleThemeStyle = isDarkMode
      ? styles.titleTextDark
      : styles.titleTextLight;
    const iconColor = isDarkMode ? '#DDDDDD' : '#444444';

    return (
      <Animated.View
        style={[
          styles.container,
          {
            height: this.heightAnim,
            transform: this.pan.getTranslateTransform(),
          },
        ]}>
        <View style={[styles.card, cardThemeStyle]}>
          {/* Draggable Header */}
          <View {...this._panResponder.panHandlers} style={styles.header}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.titleContainer}>
              <IconFeather name="activity" size={16} color="#007AFF" />
              <Text
                style={[styles.titleText, titleThemeStyle]}
                numberOfLines={1}>
                {title}
              </Text>
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                onPress={() => this.toggleMinimize()}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                style={styles.iconButton}>
                <Icon
                  name={isMinimized ? 'arrowsalt' : 'shrink'}
                  size={14}
                  color={iconColor}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.handleClose()}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                style={styles.iconButton}>
                <Icon name="close" size={14} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Window Body Content */}
          {!isMinimized && (
            <View style={styles.content}>
              {children ? children : this.renderDefaultContent()}
            </View>
          )}
        </View>
      </Animated.View>
    );
  }
}
