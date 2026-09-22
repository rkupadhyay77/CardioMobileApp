import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import IconFeather from 'react-native-vector-icons/Feather';
import TopHeader from '../../common/component/topHeader';
import getStateItem from '../../state/getStateItem';
import setStateItem from '../../state/setState/setStateItem';
import ThemeChange from '../../state/emitters/themeChange';
import EventLoggingChange from '../../state/emitters/eventLoggingChange';
import {DB_KEY} from '../../common/helper/keys';
import LogFileManager, {
  LogFilesEventEmitter,
  getCurrentUserIdentifier,
} from '../../common/helper/logFileManager';
import styles from './styles';

export default class LogsFileScreen extends Component {
  constructor(props) {
    super(props);

    this.eventThemeChange = this.eventThemeChange.bind(this);
    this.eventLoggingChangeListener = this.eventLoggingChangeListener.bind(this);
    this.eventLogFilesChanged = this.eventLogFilesChanged.bind(this);

    this.state = {
      themeChanged: getStateItem(DB_KEY.IS_DARK_MODE) || false,
      activeTab: 'files', // 'files' | 'live'
      currentUser: getCurrentUserIdentifier(),
      savedFiles: [],
      eventLogArray: getStateItem(DB_KEY.EVENT_LOG_ARRAY) || [],
      selectedFileForPreview: null,
      showPreviewModal: false,
    };
  }

  componentDidMount() {
    ThemeChange.addThemeChangeListener(this.eventThemeChange);
    EventLoggingChange.addEventLoggingChangeListener(this.eventLoggingChangeListener);
    LogFilesEventEmitter.addLogFilesChangeListener(this.eventLogFilesChanged);

    const {navigation} = this.props;
    if (navigation && navigation.addListener) {
      this.focusListener = navigation.addListener('didFocus', () => {
        const user = getCurrentUserIdentifier();
        this.setState({currentUser: user});
        this.loadSavedFiles(user);
      });
    }

    this.loadSavedFiles();
  }

  componentWillUnmount() {
    ThemeChange.removeThemeChangeListener(this.eventThemeChange);
    EventLoggingChange.removeEventLoggingChangeListener(this.eventLoggingChangeListener);
    LogFilesEventEmitter.removeLogFilesChangeListener(this.eventLogFilesChanged);
    if (this.focusListener) {
      this.focusListener.remove();
    }
  }

  async loadSavedFiles(user) {
    const userToQuery = user || this.state.currentUser || getCurrentUserIdentifier();
    const files = await LogFileManager.getLogFilesForUser(userToQuery);
    this.setState({savedFiles: files, currentUser: userToQuery});
  }

  eventThemeChange() {
    const isDark = getStateItem(DB_KEY.IS_DARK_MODE) || false;
    this.setState({themeChanged: isDark});
  }

  eventLoggingChangeListener() {
    const eventLogArray = getStateItem(DB_KEY.EVENT_LOG_ARRAY) || [];
    this.setState({eventLogArray});
  }

  eventLogFilesChanged() {
    this.loadSavedFiles();
  }

  back() {
    if (this.props.navigation && this.props.navigation.goBack) {
      this.props.navigation.goBack();
    } else {
      const nav = getStateItem(DB_KEY.LOGIN_NAV);
      if (nav && nav.goBack) {
        nav.goBack();
      }
    }
  }

  deleteFile(file) {
    Alert.alert(
      'Delete Log File',
      `Are you sure you want to delete ${file.fileName}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await LogFileManager.deleteLogFile(file.id, this.state.currentUser);
            this.loadSavedFiles();
          },
        },
      ],
      {cancelable: true},
    );
  }

  emailFile(file) {
    LogFileManager.emailLogFile(file);
  }

  previewFile(file) {
    this.setState({selectedFileForPreview: file, showPreviewModal: true});
  }

  closePreviewModal() {
    this.setState({selectedFileForPreview: null, showPreviewModal: false});
  }

  async saveLiveLogsToFile() {
    const saved = await LogFileManager.saveCurrentSessionToFile(true);
    if (saved) {
      await this.loadSavedFiles();
      Alert.alert(
        'Log File Saved',
        `Current session saved as ${saved.fileName}. You can view it in the Saved Files tab.`,
        [{text: 'OK'}],
      );
    } else {
      Alert.alert('No Events', 'There are no active events to save.');
    }
  }

  clearLiveLogs() {
    Alert.alert(
      'Clear Live Events',
      'Are you sure you want to clear current in-memory events?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setStateItem(DB_KEY.EVENT_LOG_ARRAY, []);
            EventLoggingChange.emit('EVENT_LOGGING_CHANGE');
            this.setState({eventLogArray: []});
          },
        },
      ],
      {cancelable: true},
    );
  }

  _renderFileRow = ({item}) => {
    const {themeChanged} = this.state;
    const formattedDate = item.formattedDate || item.savedAt || '';
    const eventCount = item.eventCount || 0;
    const sizeKb = item.sizeBytes ? `${(item.sizeBytes / 1024).toFixed(1)} KB` : '';

    return (
      <View
        style={[
          styles.fileCard,
          themeChanged ? styles.fileCardDark : styles.fileCardLight,
        ]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => this.previewFile(item)}
          style={styles.fileCardHeader}>
          <View style={styles.fileIconWrapper}>
            <IconFeather name="file-text" size={18} color="#007AFF" />
          </View>
          <View style={styles.fileHeaderInfo}>
            <Text
              allowFontScaling={false}
              style={[
                styles.fileNameText,
                {color: themeChanged ? '#F5F5F5' : '#1A1A1A'},
              ]}
              numberOfLines={1}>
              {item.fileName}
            </Text>
            <View style={styles.fileMetaRow}>
              <IconFeather
                name="clock"
                size={11}
                color="#888888"
              />
              <Text allowFontScaling={false} style={styles.fileMetaText}>
                {formattedDate}
              </Text>
              <Text allowFontScaling={false} style={styles.fileBadgeText}>
                {eventCount} {eventCount === 1 ? 'event' : 'events'}
                {sizeKb ? ` • ${sizeKb}` : ''}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View
          style={[
            styles.cardDivider,
            themeChanged ? styles.cardDividerDark : styles.cardDividerLight,
          ]}
        />

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => this.previewFile(item)}>
            <IconFeather name="eye" size={13} color="#007AFF" />
            <Text allowFontScaling={false} style={styles.viewButtonText}>
              View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.emailButton]}
            onPress={() => this.emailFile(item)}>
            <IconFeather name="mail" size={13} color="#34C759" />
            <Text allowFontScaling={false} style={styles.emailButtonText}>
              Email
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => this.deleteFile(item)}>
            <IconFeather name="trash-2" size={13} color="#FF3B30" />
            <Text allowFontScaling={false} style={styles.deleteButtonText}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _renderLiveLogRow = ({item, index}) => {
    const {themeChanged} = this.state;
    const time = item._time || item.timestamp || '';
    const description =
      item.description ||
      item.message ||
      (typeof item === 'string' ? item : JSON.stringify(item));

    return (
      <View
        style={[
          styles.logItem,
          themeChanged ? styles.logItemDark : styles.logItemLight,
        ]}>
        <View style={styles.logHeaderRow}>
          <View style={styles.timeBadge}>
            <IconFeather
              name="clock"
              size={12}
              color={themeChanged ? '#AAAAAA' : '#666666'}
              style={{marginRight: 4}}
            />
            <Text
              allowFontScaling={false}
              style={[
                styles.timeText,
                {color: themeChanged ? '#CCCCCC' : '#555555'},
              ]}>
              {time}
            </Text>
          </View>
          <Text allowFontScaling={false} style={styles.indexBadge}>
            #{index + 1}
          </Text>
        </View>
        <Text
          allowFontScaling={false}
          style={[
            styles.descriptionText,
            {color: themeChanged ? '#E0E0E0' : '#222222'},
          ]}>
          {description}
        </Text>
      </View>
    );
  };

  _renderEmptyFiles = () => {
    const {themeChanged} = this.state;
    return (
      <View style={styles.emptyContainer}>
        <IconFeather
          name="folder"
          size={46}
          color={themeChanged ? '#555555' : '#BBBBBB'}
        />
        <Text
          allowFontScaling={false}
          style={[
            styles.emptyTitle,
            {color: themeChanged ? '#F0F0F0' : '#333333'},
          ]}>
          No Saved Log Files
        </Text>
        <Text allowFontScaling={false} style={styles.emptySubtitle}>
          When the Floating Window is active, events are recorded into a session. Closing the window automatically saves a timestamped .txt file here.
        </Text>
      </View>
    );
  };

  _renderEmptyLiveLogs = () => {
    const {themeChanged} = this.state;
    return (
      <View style={styles.emptyContainer}>
        <IconFeather
          name="activity"
          size={46}
          color={themeChanged ? '#555555' : '#BBBBBB'}
        />
        <Text
          allowFontScaling={false}
          style={[
            styles.emptyTitle,
            {color: themeChanged ? '#F0F0F0' : '#333333'},
          ]}>
          No Live Events
        </Text>
        <Text allowFontScaling={false} style={styles.emptySubtitle}>
          There are currently no events in the active memory buffer.
        </Text>
      </View>
    );
  };

  _renderPreviewModal() {
    const {selectedFileForPreview, showPreviewModal, themeChanged} = this.state;
    if (!showPreviewModal || !selectedFileForPreview) {
      return null;
    }

    return (
      <Modal
        visible={showPreviewModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => this.closePreviewModal()}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              themeChanged ? styles.modalContentDark : styles.modalContentLight,
            ]}>
            <View
              style={[
                styles.modalHeader,
                {
                  borderBottomColor: themeChanged
                    ? 'rgba(60,60,65,1.0)'
                    : 'rgba(230,230,230,1.0)',
                },
              ]}>
              <Text
                allowFontScaling={false}
                style={[
                  styles.modalTitle,
                  {color: themeChanged ? '#F5F5F5' : '#222222'},
                ]}
                numberOfLines={1}>
                {selectedFileForPreview.fileName}
              </Text>
              <TouchableOpacity onPress={() => this.closePreviewModal()}>
                <IconFeather
                  name="x"
                  size={20}
                  color={themeChanged ? '#DDDDDD' : '#555555'}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text
                allowFontScaling={false}
                style={[
                  styles.modalText,
                  {color: themeChanged ? '#CCCCCC' : '#333333'},
                ]}>
                {selectedFileForPreview.content}
              </Text>
            </ScrollView>

            <View
              style={[
                styles.modalFooter,
                {
                  borderTopColor: themeChanged
                    ? 'rgba(60,60,65,1.0)'
                    : 'rgba(230,230,230,1.0)',
                },
              ]}>
              <TouchableOpacity
                style={[styles.modalFooterButton, styles.modalEmailButton]}
                onPress={() => this.emailFile(selectedFileForPreview)}>
                <IconFeather name="mail" size={14} color="#FFFFFF" />
                <Text
                  allowFontScaling={false}
                  style={styles.modalEmailButtonText}>
                  Email File
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalFooterButton, styles.modalCloseButton]}
                onPress={() => this.closePreviewModal()}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.modalCloseButtonText,
                    {color: themeChanged ? '#CCCCCC' : '#444444'},
                  ]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    const {
      themeChanged,
      activeTab,
      currentUser,
      savedFiles,
      eventLogArray,
    } = this.state;

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeChanged
              ? 'rgba(27,26,29,1.0)'
              : 'rgba(249,249,249,1.0)',
          },
        ]}>
        <TopHeader
          leftTitle={'Logs File'}
          isDarkMode={themeChanged}
          onLeftIconPress={() => this.back()}
          macAddress={''}
        />

        {/* User identification banner */}
        <View
          style={[
            styles.userBanner,
            {
              backgroundColor: themeChanged
                ? 'rgba(32,32,35,1.0)'
                : 'rgba(242,242,247,1.0)',
              borderBottomColor: themeChanged
                ? 'rgba(50,50,55,1.0)'
                : 'rgba(225,225,230,1.0)',
            },
          ]}>
          <View style={styles.userIconContainer}>
            <IconFeather
              name="user"
              size={14}
              color={themeChanged ? '#AAAAAA' : '#666666'}
            />
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text allowFontScaling={false} style={styles.userLabelText}>
              User:{' '}
            </Text>
            <Text
              allowFontScaling={false}
              style={[
                styles.userNameText,
                {color: themeChanged ? '#FFFFFF' : '#1A1A1A'},
              ]}>
              {currentUser}
            </Text>
          </View>
        </View>

        {/* Tab switcher: Saved Files vs Live Events */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'files'
                ? styles.tabButtonActive
                : themeChanged
                ? styles.tabButtonInactiveDark
                : styles.tabButtonInactiveLight,
            ]}
            onPress={() => this.setState({activeTab: 'files'})}>
            <Text
              allowFontScaling={false}
              style={[
                styles.tabText,
                activeTab === 'files'
                  ? styles.tabTextActive
                  : themeChanged
                  ? styles.tabTextInactiveDark
                  : styles.tabTextInactiveLight,
              ]}>
              Saved Files
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab !== 'files' && styles.tabBadgeInactive,
              ]}>
              <Text
                allowFontScaling={false}
                style={[
                  styles.tabBadgeText,
                  {
                    color:
                      activeTab === 'files'
                        ? '#FFFFFF'
                        : themeChanged
                        ? '#CCCCCC'
                        : '#555555',
                  },
                ]}>
                {savedFiles.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'live'
                ? styles.tabButtonActive
                : themeChanged
                ? styles.tabButtonInactiveDark
                : styles.tabButtonInactiveLight,
            ]}
            onPress={() => this.setState({activeTab: 'live'})}>
            <Text
              allowFontScaling={false}
              style={[
                styles.tabText,
                activeTab === 'live'
                  ? styles.tabTextActive
                  : themeChanged
                  ? styles.tabTextInactiveDark
                  : styles.tabTextInactiveLight,
              ]}>
              Live Events
            </Text>
            <View
              style={[
                styles.tabBadge,
                activeTab !== 'live' && styles.tabBadgeInactive,
              ]}>
              <Text
                allowFontScaling={false}
                style={[
                  styles.tabBadgeText,
                  {
                    color:
                      activeTab === 'live'
                        ? '#FFFFFF'
                        : themeChanged
                        ? '#CCCCCC'
                        : '#555555',
                  },
                ]}>
                {eventLogArray.length}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Content based on selected tab */}
        {activeTab === 'files' ? (
          <FlatList
            contentContainerStyle={[
              styles.listContent,
              savedFiles.length === 0 && {flex: 1},
            ]}
            data={savedFiles}
            renderItem={this._renderFileRow}
            keyExtractor={item => item.id}
            ListEmptyComponent={this._renderEmptyFiles}
          />
        ) : (
          <View style={{flex: 1}}>
            {eventLogArray.length > 0 && (
              <View
                style={[
                  styles.headerBar,
                  {
                    backgroundColor: themeChanged
                      ? 'rgba(30,30,32,1.0)'
                      : '#FFFFFF',
                    borderBottomColor: themeChanged
                      ? 'rgba(50,50,55,1.0)'
                      : 'rgba(230,230,230,1.0)',
                  },
                ]}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.logCountText,
                    {color: themeChanged ? '#F0F0F0' : '#333333'},
                  ]}>
                  {eventLogArray.length}{' '}
                  {eventLogArray.length === 1 ? 'Live Entry' : 'Live Entries'}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <TouchableOpacity
                    style={[styles.clearButton, {backgroundColor: '#007AFF', marginRight: 8}]}
                    onPress={() => this.saveLiveLogsToFile()}>
                    <Text
                      allowFontScaling={false}
                      style={[styles.clearButtonText, {color: '#FFFFFF'}]}>
                      Save as File
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => this.clearLiveLogs()}>
                    <Text allowFontScaling={false} style={styles.clearButtonText}>
                      Clear Events
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <FlatList
              contentContainerStyle={[
                styles.listContent,
                eventLogArray.length === 0 && {flex: 1},
              ]}
              data={eventLogArray}
              renderItem={this._renderLiveLogRow}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={this._renderEmptyLiveLogs}
            />
          </View>
        )}

        {this._renderPreviewModal()}
      </View>
    );
  }
}
