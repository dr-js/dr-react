import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { WIDGET_SHAPE_TYPE } from 'source/widget/type/shape'
import { WIDGET_MINI_SAMPLE_MAP } from 'source/widget/data/sample'

import { renderSample } from './Sample'

import LocalClassName from './sample-layer.pcss'
const CSS_SAMPLE_LAYER = LocalClassName[ 'sample-layer' ]

const EMPTY_FUNC = () => {}

const samplePropsPack = { zoom: 1, isLock: false, setRef: EMPTY_FUNC }
const samplePropsPackLock = { zoom: 1, isLock: true, setRef: EMPTY_FUNC }

class SampleLayer extends PureComponent {
  static propTypes = {
    isLock: PropTypes.bool,
    selectSampleShape: PropTypes.string,
    funcPack: PropTypes.shape({
      setSelectSampleShape: PropTypes.func.isRequired,
      setSampleLayerElement: PropTypes.func.isRequired,
      setSampleElement: PropTypes.func.isRequired
    }).isRequired
  }

  constructor (props) {
    super(props)

    const clearSelect = () => !this.props.isLock && this.props.funcPack.setSelectSampleShape(null)

    this.renderSampleMap = Object.keys(WIDGET_MINI_SAMPLE_MAP).reduce((o, shape) => {
      const ref = (ref) => this.props.funcPack.setSampleElement(shape, ref)
      const setSelect = () => !this.props.isLock && this.props.funcPack.setSelectSampleShape(shape)
      const sampleWidget = WIDGET_MINI_SAMPLE_MAP[ shape ]

      o[ shape ] = (selectSampleShape) => {
        const isSelect = selectSampleShape === shape
        return <div {...{ ref, className: `widget-sample-wrapper beta ${isSelect ? 'select' : ''}`, onClick: isSelect ? clearSelect : setSelect }}>
          {renderSample(sampleWidget, false, this.props.isLock ? samplePropsPackLock : samplePropsPack)}
        </div>
      }

      return o
    }, {})
  }

  render () {
    const { isLock, selectSampleShape, funcPack: { setSampleLayerElement } } = this.props

    return <div className={`${CSS_SAMPLE_LAYER} LEFT-PANEL`}>
      <div ref={setSampleLayerElement} className={`widget-sample-panel ${isLock ? 'lock' : ''}`}>
        {this.renderSampleMap[ WIDGET_SHAPE_TYPE.RECT ](selectSampleShape)}
        {this.renderSampleMap[ WIDGET_SHAPE_TYPE.LINE ](selectSampleShape)}
        {this.renderSampleMap[ WIDGET_SHAPE_TYPE.ELBOW ](selectSampleShape)}
      </div>
    </div>
  }
}

export { SampleLayer }
