import { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { WIDGET_SHAPE_TYPE } from 'source/state/widget/type/shape'
import { WIDGET_MINI_SAMPLE_MAP } from 'source/state/widget/data/sample'

import { renderSample } from './Sample'

const SampleLayerDiv = styled.div`
  pointer-events: auto;
  display: flex;
  flex-flow: column;
`

const WidgetSamplePanelDiv = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  padding: 6px;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background: #fff;
`

const WidgetSampleWrapperDiv = styled.div`
  width: 100%;
  height: 62px;
  margin-bottom: 6px;
  &:hover { background: rgba(0, 0, 0, 0.03); }
  &.select { box-shadow: 0 0 0 2px #f66; }
  &.lock { cursor: not-allowed; opacity: 0.4; }

  /* debug */
  display: flex; 
  align-items: center; 
  justify-content: center; 
`

const EMPTY_FUNC = () => {}
const samplePropsPack = { zoom: 1, isLock: false, setRef: EMPTY_FUNC }
const samplePropsPackLock = { zoom: 1, isLock: true, setRef: EMPTY_FUNC }

class SampleLayer extends PureComponent {
  static propTypes = {
    isLock: PropTypes.bool,
    selectSampleShape: PropTypes.string,
    className: PropTypes.string,
    funcPack: PropTypes.shape({
      setSelectSampleShape: PropTypes.func.isRequired,
      setSampleLayerElement: PropTypes.func.isRequired,
      setSampleElement: PropTypes.func.isRequired,
      doToggleMode: PropTypes.func.isRequired,
      doToggleLock: PropTypes.func.isRequired
    }).isRequired
  }

  constructor (props) {
    super(props)

    const clearSelect = () => !this.props.isLock && this.props.funcPack.setSelectSampleShape(null)

    this.sampleMap = Object.keys(WIDGET_MINI_SAMPLE_MAP).reduce((o, shape) => {
      const ref = (ref) => this.props.funcPack.setSampleElement(shape, ref)
      const setSelect = () => !this.props.isLock && this.props.funcPack.setSelectSampleShape(shape)
      const sampleWidget = WIDGET_MINI_SAMPLE_MAP[ shape ]

      o[ shape ] = (selectSampleShape, isLock) => {
        const isSelect = selectSampleShape === shape
        return <WidgetSampleWrapperDiv {...{ ref, className: `${isSelect ? 'select' : ''} ${isLock ? 'lock' : ''}`, onClick: isSelect ? clearSelect : setSelect }}>
          {renderSample(sampleWidget, false, this.props.isLock ? samplePropsPackLock : samplePropsPack)}
        </WidgetSampleWrapperDiv>
      }

      return o
    }, {})
  }

  render () {
    const { isLock, selectSampleShape, className, funcPack: { setSampleLayerElement, doToggleMode, doToggleLock } } = this.props

    return <SampleLayerDiv className={className || ''}>
      <WidgetSamplePanelDiv ref={setSampleLayerElement} className={isLock ? 'lock' : ''}>
        <WidgetSampleWrapperDiv className="lock" onClick={doToggleMode}>{'Mode'}</WidgetSampleWrapperDiv>
        <WidgetSampleWrapperDiv className={isLock ? 'select' : ''} onClick={doToggleLock}>{isLock ? 'Lock' : 'UnLock'}</WidgetSampleWrapperDiv>
        {this.sampleMap[ WIDGET_SHAPE_TYPE.RECT ](selectSampleShape, isLock)}
        {this.sampleMap[ WIDGET_SHAPE_TYPE.LINE ](selectSampleShape, isLock)}
        {this.sampleMap[ WIDGET_SHAPE_TYPE.ELBOW ](selectSampleShape, isLock)}
      </WidgetSamplePanelDiv>
    </SampleLayerDiv>
  }
}

export { SampleLayer }
