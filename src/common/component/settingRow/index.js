import React, { Component } from 'react'
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import styles from './styles'
import getStateItem from '../../../state/getStateItem';
import { DB_KEY } from '../../helper/keys';

import Icon from 'react-native-vector-icons/Entypo'
import setStateItem from '../../../state/setState/setStateItem';
import { FloatingWindowChanged } from '../../../state/emitters';


const {width , height }  = Dimensions.get('window')

export default class SettingRow extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isPerfEnabled: getStateItem(DB_KEY.IS_PREF_ENABLED),
            isEventLoggingEnabled: getStateItem(DB_KEY.IS_EVENT_LOGIN_ENABLED),
            showCodeModal: false,
            enteredCode: '',
            codeError: '',
        }
    }

    componentDidMount() {
        if (this.props.isSwitch) {
            this.floatingWindowListener = (payload) => {
                if (payload && payload.visible !== undefined) {
                    this.setState({isEventLoggingEnabled: payload.visible});
                }
            };
            FloatingWindowChanged.addFloatingWindowChangeListener(this.floatingWindowListener);
        }
    }

    componentWillUnmount() {
        if (this.props.isSwitch && this.floatingWindowListener) {
            FloatingWindowChanged.removeFloatingWindowChangeListener(this.floatingWindowListener);
        }
    }

    changePrefSetting() {
        let isPerfEnabled = getStateItem(DB_KEY.IS_PREF_ENABLED)
        let valueToSet = isPerfEnabled === true ? false : true
        setStateItem(DB_KEY.IS_PREF_ENABLED, valueToSet)

        this.setState({isPerfEnabled : !this.state.isPerfEnabled});
    }

    enableEventLogging() {
        setStateItem(DB_KEY.IS_EVENT_LOGIN_ENABLED, true);
        setStateItem(DB_KEY.EVENT_LOG_ARRAY, []);
        this.setState({
            isEventLoggingEnabled: true,
            showCodeModal: false,
            enteredCode: '',
            codeError: '',
        });
        FloatingWindowChanged.show();
    }

    disableEventLogging() {
        setStateItem(DB_KEY.IS_EVENT_LOGIN_ENABLED, false);
        setStateItem(DB_KEY.EVENT_LOG_ARRAY, []);
        this.setState({
            isEventLoggingEnabled: false,
            showCodeModal: false,
            enteredCode: '',
            codeError: '',
        });
        FloatingWindowChanged.hide();
    }

    verifyCode(code) {
        if (code && code.trim() === 'Wayne') {
            this.enableEventLogging();
            return true;
        } else {
            this.setState({
                isEventLoggingEnabled: false,
                codeError: 'Incorrect code',
            });
            Alert.alert('Error', 'Incorrect code');
            return false;
        }
    }

    changeEventLoggingSetting(val) {
        const isEventLoggingEnabled = getStateItem(DB_KEY.IS_EVENT_LOGIN_ENABLED);
        const valueToSet = typeof val === 'boolean' ? val : (isEventLoggingEnabled === true ? false : true);

        if (valueToSet) {
            if (Platform.OS === 'ios' && typeof Alert.prompt === 'function') {
                Alert.prompt(
                    'Enter Code',
                    'Please enter the code to enable event logging',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => {
                                this.setState({isEventLoggingEnabled: false});
                            },
                            style: 'cancel',
                        },
                        {
                            text: 'OK',
                            onPress: (code) => {
                                this.verifyCode(code);
                            },
                        },
                    ],
                    'plain-text',
                    ''
                );
            } else {
                this.setState({
                    showCodeModal: true,
                    enteredCode: '',
                    codeError: '',
                });
            }
        } else {
            this.disableEventLogging();
        }
    }

    _renderSwitch(){
        const {isSwitch, ...props} = this.props
        const {isEventLoggingEnabled} = this.state
        if (isSwitch) {
            return (
                <View style = {styles.switchContainer}>
                  <Switch
                    trackColor={{false: '#767577', true: '#008000'}}
                    thumbColor={isEventLoggingEnabled ? '#008000' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={(val) => this.changeEventLoggingSetting(val)}
                    value={isEventLoggingEnabled}
                />
       </View>
            )
        }else{
            return(<View />)
        }
    }
    _renderIcon(){
        const {isIcon,isSwitch, ...props} = this.props
        const {isPerfEnabled} = this.state
        if (isIcon){
            return(
                <View style = {styles.iconContainer}>
                <Icon name= {'chevron-thin-right'} size = {height*0.02} color = {'rgba(136,136,136,1.0)'} />
             </View>
            )
        }
        else{
            return(<View />)
        }
    }

    _renderSelectedType(){
        const {selectedType,isIcon, ...props} = this.props
        if (selectedType){
            return(
                <View style = {styles.selectedTypeContainer}>
                <Text  allowFontScaling={false} style = {[styles.selectedType, isIcon?{width:width*0.35}:{width:width*0.40}]}>{selectedType}</Text>
             </View>
            )
        }else{
            return (
                <View />
            )
        }
    }

    _renderTitle(){
        const {title, ...props} = this.props
        if (title){
            return(
                <View style = {styles.titleContainer}>
                <Text  allowFontScaling={false} style={styles.title}>{title}</Text>
             </View>
            )
        }else{
            return (
                <View />
            )
        }
    }


    _renderCodeModal() {
        if (!this.state.showCodeModal) {
            return null;
        }
        return (
            <Modal
                transparent={true}
                visible={this.state.showCodeModal}
                animationType="fade"
                onRequestClose={() => {
                    this.setState({
                        showCodeModal: false,
                        enteredCode: '',
                        codeError: '',
                        isEventLoggingEnabled: false,
                    });
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalOverlay}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.modalBackdropTouchable}
                        onPress={() => {
                            this.setState({
                                showCodeModal: false,
                                enteredCode: '',
                                codeError: '',
                                isEventLoggingEnabled: false,
                            });
                        }}
                    />
                    <View style={styles.modalContainer}>
                        <Text allowFontScaling={false} style={styles.modalTitle}>
                            Enter Code
                        </Text>
                        <Text allowFontScaling={false} style={styles.modalSubtitle}>
                            Please enter the code to enable event logging
                        </Text>
                        <TextInput
                            allowFontScaling={false}
                            style={styles.modalInput}
                            placeholder="Enter code"
                            placeholderTextColor="#888888"
                            value={this.state.enteredCode}
                            onChangeText={(text) => this.setState({enteredCode: text, codeError: ''})}
                            autoFocus={true}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {this.state.codeError ? (
                            <Text allowFontScaling={false} style={styles.modalErrorText}>
                                {this.state.codeError}
                            </Text>
                        ) : null}
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {
                                    this.setState({
                                        showCodeModal: false,
                                        enteredCode: '',
                                        codeError: '',
                                        isEventLoggingEnabled: false,
                                    });
                                }}
                            >
                                <Text allowFontScaling={false} style={styles.modalCancelButtonText}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.modalButtonDivider} />
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {
                                    this.verifyCode(this.state.enteredCode);
                                }}
                            >
                                <Text allowFontScaling={false} style={styles.modalSubmitButtonText}>
                                    OK
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    }

    render() {
        const {onPress, ...props} = this.props
        return (
          <TouchableOpacity style={styles.container} onPress={onPress}>  
              {this._renderTitle()} 
              {this._renderSelectedType()}
              {this._renderIcon()}
              {this._renderSwitch()}
              {this._renderCodeModal()}
            </TouchableOpacity>
        )
      }
}