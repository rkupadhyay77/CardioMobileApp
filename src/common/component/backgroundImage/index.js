import React, { Component } from 'react'
import { Image } from 'react-native'
import styles from './style'


class BackgroundImage extends Component {
  render() {
    const {source, style, ...props} = this.props
    return (
      <Image source={source || require("../../../img/background.png")}
              style={ styles.backgroundImageContainer}
             {...props}>
      </Image>
    )
  }
}

export default BackgroundImage