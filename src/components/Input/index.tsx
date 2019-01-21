/*
 * @Author: mengqian02
 * @Date: 2018-11-20 11:26:57
 */

import React, { Component } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInputProps
} from 'react-native'

import inputStyles from './styles'
import variables from '../../common/styles/variables'
import { Icon } from '../Icon'
import { FormItemConsumer } from '../Form/formItemContext'

const styles = StyleSheet.create<any>(inputStyles)

interface InputProps extends TextInputProps {
}

interface InputState {
  isEditing: boolean
}

export class Input extends Component<InputProps, InputState> {
  static displayName = 'Input'
  static defaultProps = {
    onChange: () => { return },
    textAlign: 'left',
    placeholder: '请输入',
    placeholderTextColor: variables.mtdGrayLighter,
    autoFocus: false,
    autoCorrect: true,
    keyboardType: 'default',
    maxLength: null,
    editable: true,
    clearButtonMode: 'while-editing',
    value: ''
  }

  debounce = null
  debounceCallback = null
  delayIsEditing = null
  formItemContext = null

  constructor (props) {
    super(props)
    this.state = {
      isEditing: false
    }

    this.delayIsEditing = this.delayTaskMemoize(3000)
  }

  handleChange = (value) => {
    if (this.props.onChange) {
      this.props.onChange(value)
    }

    // 自动触发change类型校验
    if (this.formItemContext && this.formItemContext.emitValueChange) {
      this.formItemContext.emitValueChange(value)
    }
  }

  handleBlur = (e) => {
    if (this.props.onBlur) {
      this.props.onBlur(e)
    }

    // 自动触发blur类型校验
    if (this.formItemContext && this.formItemContext.emitValueBlur) {
      this.formItemContext.emitValueBlur(this.props.value)
    }
  }

  handleFocus = (e) => {
    if (this.props.onFocus) {
      this.props.onFocus(e)
    }
  }

  delayTaskMemoize = (duration) => {
    let timeoutId

    return {
      cancel () {
        clearTimeout(timeoutId)
      },

      delay (task) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          task()
        }, duration || 0)
      }
    }
  }

  renderiOS = () => {
    return (
      <View style={[styles.container, { flexDirection: 'column', justifyContent: 'center' }]}>
        <FormItemConsumer>
          { (contextObject) => {
            this.formItemContext = contextObject
            return (null)
          }}
        </FormItemConsumer>
        <TextInput
          {...this.props}
          style={[styles.inputStyle, this.props.style]}
          onChange={() => { return }}
          onChangeText={this.handleChange}
          onFocus={this.handleFocus.bind(this)}
          onBlur={this.handleBlur.bind(this)}
        />
      </View>
    )
  }

  renderAndroid = () => {
    const androidClearButtonMode = this.props.clearButtonMode && this.props.clearButtonMode !== 'never'
    const showDelIcon = androidClearButtonMode && this.props.value && this.state.isEditing

    return (
      <View style={[styles.container, { flexDirection: 'row', alignItems: 'center' }]}>
        <FormItemConsumer>
          { (contextObject) => {
            this.formItemContext = contextObject
            return (null)
          }}
        </FormItemConsumer>
        <TextInput
          {...this.props}
          clearButtonMode='never'
          style={[styles.inputStyle, { flex: 1 }, this.props.style]}
          onChange={() => { return }}
          onChangeText={this.handleChange}

          onFocus={(e) => {
            this.handleFocus(e)
            this.delayIsEditing.cancel()
            this.setState({
              isEditing: true
            })
          }}
          onBlur={(e) => {
            this.handleBlur(e)
            this.delayIsEditing.delay(() => {
              this.setState({
                isEditing: false
              })
            })
          }}
          underlineColorAndroid='transparent'
        />
        {
          showDelIcon ?
          <TouchableOpacity
            onPress={() => {
              // console.log('press delete icon')
              this.handleChange('')
            }}>
            <Icon
              type={'times-circle'}
              size={15}
            />
          </TouchableOpacity> : null
        }
      </View>
    )
  }

  render () {
    if (Platform.OS === 'ios') {
      return this.renderiOS()
    } else {
      return this.renderAndroid()
    }
  }
}
