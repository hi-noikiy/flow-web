import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'

import clipboard from 'clipboard'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { push } from 'react-router-redux'

import { actions } from 'redux/modules/flow'

import ClipboardButton from 'react-clipboard.js'

import Input from 'components/Form/Input'
import IconButton from 'components/IconButton'
import Button from 'components/Button'

import classes from './ssh.scss'

const supportCopy = clipboard.isSupported()
function mapStateToProps (state, { flowId }) {
  const { flow } = state
  return {
    flow: flow.getIn(['data', flowId]),
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    done: actions.updateEnv,
    test: function () {},
    redirect: push,
  }, dispatch)
}

export class SSHConfig extends Component {
  static propTypes = {
    flow: ImmutablePropTypes.map,

    done: PropTypes.func.isRequired,
    test: PropTypes.func.isRequired,
    redirect: PropTypes.func.isRequired,
    i18n: PropTypes.func.isRequired,
  }

  state = {
    url: ''
  }

  componentWillReceiveProps (nextProps) {
    const { flow } = nextProps
    if (flow.getIn(['env', 'FLOW_STATUS']) === 'READY') {
      const { redirect } = nextProps
      redirect(`/flows/${flow.get('id')}`)
    }
  }

  handleUrlChange = (value) => {
    this.setState({ url: value })
  }

  handleDoneCick = () => {
    const { done, flow } = this.props
    const { url } = this.state
    return done(flow.get('id'), {
      FLOW_STATUS: 'READY',
      FLOW_GIT_URL: url
    })
  }

  handleTestClick = () => {
    const { test, flow } = this.props
    const { url } = this.state
    return test(flow.get('id'), {
      FLOW_GIT_URL: url
    })
  }

  valid (values) {
    const { url } = values
    return /^git@\w+\.\w+/.test(url)
  }

  renderGitUrl () {
    const { i18n } = this.props
    const { url } = this.state
    return <section className={classes.section}>
      <h5 className={classes.title}>
        {i18n('输入 Git 仓库地址')}
        <IconButton className={classes.question}>
          <i className='icon icon-question-thin' />
        </IconButton>
      </h5>
      <Input className={classes.addr} value={url}
        type='url' onChange={this.handleUrlChange}
        placeholder={i18n('例：git@github.com:FlowCI/flow-platform.git')} />
    </section>
  }

  renderWebhook () {
    const { i18n, flow } = this.props
    const webhook = flow.getIn(['env', 'FLOW_GIT_WEBHOOK'])
    return <section className={classes.section}>
      <h5 className={classes.title}>
        {i18n('手动添加 WebHook 地址到你的 Git 仓库')}
        <IconButton className={classes.question}>
          <i className='icon icon-question-thin' />
        </IconButton>
      </h5>
      <code className={classes.code}>
        {webhook}
        {supportCopy && <ClipboardButton
          className={`btn btn-link ${classes.copy}`}
          data-clipboard-text={webhook}>
          {i18n('复制地址')}
        </ClipboardButton>}
      </code>
    </section>
  }

  renderDeploy () {
    const { i18n } = this.props
    return <section className={classes.section}>
      <h5 className={classes.title}>
        {i18n('Deploy Key（可选）')}
        <IconButton className={classes.question}>
          <i className='icon icon-question-thin' />
        </IconButton>
        <small className={classes.subTitle}>
          {i18n('如没有 Git 仓库访问权限，请添加 Deploy Key 到 Git 仓库的项目或者用户设置')}
        </small>
      </h5>
    </section>
  }

  renderActions () {
    const { i18n } = this.props
    const enabled = this.valid(this.state)

    return <div className={classes.actions}>
      <Button className='btn-primary'
        disabled={!enabled}
        onClick={this.handleDoneCick}
      >
        {i18n('完成')}
      </Button>
      <Button className='btn-inverse'
        disabled={!enabled}
        onClick={this.handleTestClick}
      >
        {i18n('连接测试')}
      </Button>
    </div>
  }

  render () {
    return <div>
      {this.renderGitUrl()}
      {this.renderWebhook()}
      {this.renderDeploy()}
      {this.renderActions()}
    </div>
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SSHConfig)
