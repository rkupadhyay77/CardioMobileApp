import React, {Component} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import getStateItem from '../../state/getStateItem';
import {DB_KEY} from '../../common/helper/keys';
import TopHeader from '../../common/component/topHeader';
import styles from './styles';
import DatabaseManager from '../../../src/Database';
const {width, height} = Dimensions.get('window');
import Icon from 'react-native-vector-icons/Entypo';
import NotesRow from '../../common/component/notesRow';
import {NotesListingChange} from '../../state/emitters';

import {Searchbar} from 'react-native-paper';

export default class NotesListing extends Component {
  constructor(props) {
    _keyExtractor = (item, index) => index.toString();

    super(props);
    this.eventNotesListingChange = this.eventNotesListingChange.bind(this);

    this.state = {
      themeChanged: getStateItem(DB_KEY.IS_DARK_MODE),
      macAddress: props.navigation.state.params.macAddress,
      devId: props.navigation.state.params.devId,
      name: props.navigation.state.params.name,
      dataSource: [],
      selectedIndex: -1,
      refresh: false,
      searchText: '',
    };
  }

  back() {
    this.props.navigation.goBack();
  }

  componentDidMount() {
    NotesListingChange.addNotesListingChangeListener(
      this.eventNotesListingChange,
    );
    this.setState({
      dataSource: DatabaseManager.getNotesForResident(
        this.state.devId,
        this.state.macAddress,
      ),
    });
  }

  componentWillUnmount() {
    NotesListingChange.removeNotesListingChangeListener(
      this.eventNotesListingChange,
    );
  }

  editTapped(item) {
    this.props.navigation.navigate('AddNotes', {
      devId: this.state.devId,
      item: item,
      macAddress: this.state.macAddress,
    });
  }

  eventNotesListingChange() {
    this.setState({
      dataSource: DatabaseManager.getNotesForResident(
        this.state.devId,
        this.state.macAddress,
      ),
      refresh: !this.state.refresh,
    });
  }

  addNotesTapped() {
    this.props.navigation.navigate('AddNotes', {
      devId: this.state.devId,
      macAddress: this.state.macAddress,
    });
  }

  delete(item) {
    DatabaseManager.deleteNotesForResident(
      this.state.devId,
      item.timestamp,
      this.state.macAddress,
    );
    this.setState({
      dataSource: DatabaseManager.getNotesForResident(
        this.state.devId,
        this.state.macAddress,
      ),
    });
  }

  deleteTapped(item) {
    Alert.alert(
      'Delete',
      'Are you sure you want to remove this note?',
      [
        {
          text: 'No',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'Yes', onPress: () => this.delete(item)},
      ],
      {cancelable: false},
    );
  }

  renderRow(item, index) {
    const {themeChanged, selectedIndex} = this.state;
    return (
      <NotesRow
        item={item}
        isDarkMode={themeChanged}
        isExpanded={true}
        onEditTapped={() => this.editTapped(item)}
        onDeleteTapped={() => this.deleteTapped(item)}
      />
    );
  }

  onChangeSearch(text) {
    this.setState({searchText: text});
    if (this.state.searchText.length > 2) {
      this.searchForText(this.state.searchText);
    } else {
      this.setState({
        dataSource: DatabaseManager.getNotesForResident(
          this.state.devId,
          this.state.macAddress,
        ),
        refresh: !this.state.refresh,
      });
    }
  }

  searchForText(text) {
    let duplicateArray = [];

    const data = DatabaseManager.getNotesForResident(this.state.devId);
    for (var index = 0; index < data.length; index++) {
      let faq = data[index];

      let title = faq.title;
      let desc = faq.desc;
      if (
        title.toUpperCase().includes(text.toUpperCase()) ||
        desc.toUpperCase().includes(text.toUpperCase())
      ) {
        duplicateArray.push(faq);
      }
    }

    this.setState({dataSource: duplicateArray, refresh: !this.state.refresh});
  }

  onFaqPress(index) {
    const {selectedIndex} = this.state;

    if (selectedIndex !== index) {
      this.setState({selectedIndex: index});
    } else {
      this.setState({selectedIndex: -1});
    }
  }

  _renderNotes() {
    const {dataSource, themeChanged} = this.state;
    if (dataSource.length > 0) {
      return (
        <View>
          <Searchbar
            style={{
              color: themeChanged
                ? 'rgba(231,231,231,1.0)'
                : 'rgba(138,138,138,1.0)',
            }}
            placeholder="Search"
            onChangeText={text => this.onChangeSearch(text)}
            value={this.state.searchText}
          />
          <FlatList
            style={{paddingBottom: 50}}
            data={dataSource}
            renderItem={({item, index}) => this.renderRow(item, index)}
            keyExtractor={this._keyExtractor}
          />
        </View>
      );
    } else {
      return (
        <View>
          <Text
            allowFontScaling={false}
            allowFontScaling={false}
            style={{
              fontSize: height * 0.02,
              fontWeight: 'bold',
              color: 'rgba(144,144,144,1.0)',
              marginLeft: 5,
            }}>
            There are no notes for this resident
          </Text>
        </View>
      );
    }
  }

  render() {
    const {themeChanged, name} = this.state;
    const backTitle = name + ' Notes';
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
          leftTitle={backTitle}
          isDarkMode={themeChanged}
          onLeftIconPress={() => this.back()}
          macAddress={''}
        />

        <View
          style={{
            width,
            height: height * 0.7,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {this._renderNotes()}
        </View>
        <View
          style={{
            width: width,
            height: height * 0.077,
            bottom: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            style={{
              width: width * 0.4,
              height: height * 0.07,
              backgroundColor: 'blue',
              borderRadius: height * 0.035,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => this.addNotesTapped()}>
            <TouchableOpacity
              style={{
                width: width * 0.36,
                height: height * 0.06,
                borderWidth: 2,
                borderColor: 'white',
                borderRadius: height * 0.03,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}
              onPress={() => this.addNotesTapped()}>
              <Icon
                name={'circle-with-plus'}
                size={height * 0.04}
                color={'rgba(144,144,144,1.0)'}
              />
              <Text
                allowFontScaling={false}
                allowFontScaling={false}
                style={{
                  fontSize: height * 0.02,
                  fontWeight: 'bold',
                  color: 'rgba(144,144,144,1.0)',
                  marginLeft: 5,
                }}>
                Add Notes
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
