import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { applyWidgetCreatorStateProcessor } from 'source/state/widgetCreator/processor'
import { reducerMap } from 'source/state/widgetCreator/state'

import { WidgetGlobalStyle } from 'source/component/Widget/Widget'

import { SampleLayer } from './SampleLayer'
import { IndicatorLayer } from './IndicatorLayer'

const WidgetCreatorDiv = styled.div`
  pointer-events: none;
  touch-action: none;
  user-select: none;
  overflow: hidden;
  position: absolute;
  display: flex;
  flex-flow: column;
  align-items: stretch;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const mutateDataUpdate = (data, key, value) => value ? (data[ key ] = value) : delete data[ key ]

class WidgetCreator extends PureComponent {
  static propTypes = {
    stateStore: PropTypes.shape({
      setState: PropTypes.func.isRequired, // NOTE: this is not a Redux store
      getState: PropTypes.func.isRequired,
      subscribe: PropTypes.func.isRequired
    }).isRequired,
    getWidgetLayerBoundingClientRect: PropTypes.func.isRequired,
    updateExternalData: PropTypes.func.isRequired,
    appendExternalWidgetList: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)

    // element data
    this.elementRefData = { // updated in a mutable way, direct set / delete
      elementCreatorLayer: null,
      elementSampleLayer: null,
      elementSampleMap: { /* shape: element */ },
      elementIndicatorLayer: null
    }
    this.setCreatorLayerElement = (element) => mutateDataUpdate(this.elementRefData, 'elementCreatorLayer', element)

    // funcPack
    this.sampleLayerFuncPack = {
      setSelectSampleShape: (targetSampleShape) => this.props.stateStore.setState(reducerMap[ 'reducer:select-data:set-sample-shape' ](this.props.stateStore.getState(), { targetSampleShape })),
      setSampleLayerElement: (element) => mutateDataUpdate(this.elementRefData, 'elementSampleLayer', element),
      setSampleElement: (id, element) => mutateDataUpdate(this.elementRefData.elementSampleMap, id, element),
      doToggleMode: () => { window.alert('TODO: code') }, // TODO: code
      doToggleLock: () => this.props.updateExternalData({ isLock: !this.state.externalData.isLock })
    }
    this.setIndicatorLayerElement = (element) => mutateDataUpdate(this.elementRefData, 'elementIndicatorLayer', element)

    // processor
    this.clearProcessor = null
    this.applyProcessor = () => {
      this.clearProcessor = applyWidgetCreatorStateProcessor({
        stateStore: this.props.stateStore,
        elementRefData: this.elementRefData,
        appendExternalWidgetList: this.props.appendExternalWidgetList,
        getWidgetLayerBoundingClientRect: this.props.getWidgetLayerBoundingClientRect
      })
    }

    // store bind
    this.props.stateStore.subscribe((state) => this.setState(state))
    this.state = this.props.stateStore.getState()
  }

  componentDidMount () {
    this.applyProcessor()
  }

  componentWillUnmount () {
    this.clearProcessor && this.clearProcessor()
    this.clearProcessor = null
  }

  render () {
    const {
      externalData: { isLock, zoom, centerOffset, viewport },
      selectData: { selectSampleShape },
      previewData: { previewWidget, isValidPlace }
    } = this.state

    __DEV__ && console.log(`[RENDER] WidgetCreator`)

    return <WidgetCreatorDiv ref={this.setCreatorLayerElement}>
      <SampleLayer {...{ isLock, selectSampleShape, funcPack: this.sampleLayerFuncPack }} />
      <IndicatorLayer {...{ zoom, centerOffset, viewport, previewWidget, isValidPlace, isActive: Boolean(!isLock && (previewWidget || selectSampleShape)), setRef: this.setIndicatorLayerElement }} />
      <WidgetGlobalStyle />
    </WidgetCreatorDiv>
  }
}

export { WidgetCreator }
