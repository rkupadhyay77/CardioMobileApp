import React, {Component, createRef} from 'react';
import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import getStateItem from '../../state/getStateItem';
import {DB_KEY} from '../../common/helper/keys';
import TopHeader from '../../common/component/topHeader';
import FAQ from '../../dummyData/residents/FAQ';
import FAQRow from '../../common/component/faqRow';
import styles from './styles';

import {Searchbar} from 'react-native-paper';

export default class FAQScreen extends Component {
  _keyExtractor = (item, index) => index.toString();
  constructor(props) {
    super(props);

    this.state = {
      themeChanged: getStateItem(DB_KEY.IS_DARK_MODE),
      refresh: false,
      dataSource: FAQ.FAQ,
      searchText: '',
      selectedIndex: -1,
    };
  }

  back() {
    this.props.navigation.goBack();
  }

  onFaqPress(index) {
    const {selectedIndex} = this.state;

    if (selectedIndex !== index) {
      this.setState({selectedIndex: index});
    } else {
      this.setState({selectedIndex: -1});
    }
  }
  renderRow(item, index) {
    const {themeChanged, selectedIndex} = this.state;
    // const {item, isExpanded,onFaqPress,isDarkMode,...props} = this.props
    return (
      <FAQRow
        item={item}
        isDarkMode={themeChanged}
        onFaqPress={() => this.onFaqPress(index)}
        isExpanded={selectedIndex === index ? true : false}
      />
    );
  }
  onChangeSearch(text) {
    this.setState({searchText: text});
    if (this.state.searchText.length > 2) {
      this.searchForText(this.state.searchText);
    } else {
      this.setState({dataSource: FAQ.FAQ, refresh: !this.state.refresh});
    }
  }

  searchForText(text) {
    let duplicateArray = [];

    const data = FAQ.FAQ;
    for (var index = 0; index < data.length; index++) {
      let faq = data[index];

      let question = faq.question;
      if (question.includes(text)) {
        duplicateArray.push(faq);
      }
    }

    this.setState({dataSource: duplicateArray, refresh: !this.state.refresh});
  }

  render() {
    const {themeChanged, dataSource} = this.state;
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
          leftTitle={'FAQ'}
          isDarkMode={themeChanged}
          onLeftIconPress={() => this.back()}
          macAddress={''}
        />
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
          extraData={this.state.refresh}
          data={dataSource}
          renderItem={({item, index}) => this.renderRow(item, index)}
          keyExtractor={this._keyExtractor}
        />
      </View>
    );
  }
}
