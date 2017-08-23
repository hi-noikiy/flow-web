import React, { Component } from 'react'
import { string, func } from 'prop-types'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { actions } from 'redux/modules/flow'

import Input from 'components/Form/Input'
import Button from 'components/Button'

import { Section, SectionTitle } from '../components/Section'
import WebhookSection from '../components/WebhookSection'

import classes from './ssh.scss'

function mapStateToProps (state, { flowId }) {
  const { flow } = state
  const f = flow.getIn(['data', flowId])
  return {
    webhook: f.getIn(['envs', 'FLOW_GIT_WEBHOOK']),
    defaultGitUrl: f.getIn(['envs', 'FLOW_GIT_URL'], ''),
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    done: actions.doneCreate,
    test: actions.doCreateTest,
  }, dispatch)
}

export class SSHConfig extends Component {
  static propTypes = {
    flowId: string.isRequired,
    webhook: string.isRequired,
    defaultGitUrl: string,
    git: string,

    done: func.isRequired,
    test: func.isRequired,
    i18n: func.isRequired,
  }

  state = {
    url: this.props.defaultGitUrl,
  }

  getGitSource () {
    const { git } = this.props
    return git ? git.toUpperCase() : 'UNDEFINED_SSH'
  }

  handleUrlChange = (value) => {
    this.setState({ url: value })
  }

  handleDoneCick = () => {
    const { done, flowId } = this.props
    const { url } = this.state
    const source = this.getGitSource()
    return done(flowId, source, url)
  }

  handleTestClick = () => {
    const { test, flowId } = this.props
    const { url } = this.state
    const source = this.getGitSource()
    return test(flowId, source, url)
  }

  valid (values) {
    const { url } = values
    return /^git@\w+\.\w+/.test(url)
  }

  renderGitUrl () {
    const { i18n } = this.props
    const { url } = this.state
    return <Section>
      <SectionTitle title={i18n('输入 Git 仓库地址')}
        question='link for doc'
      />
      <Input className={classes.addr} value={url}
        type='url' onChange={this.handleUrlChange}
        placeholder={i18n('例：git@github.com:FlowCI/flow-platform.git')} />
    </Section>
  }

  renderWebhook () {
    const { i18n, webhook } = this.props
    return <WebhookSection i18n={i18n} webhook={webhook} />
  }

  renderDeploy () {
    const { i18n } = this.props
    return <Section>
      <SectionTitle title={i18n('Deploy Key（可选）')}
        question='link for doc'
        subTitle={i18n('如没有 Git 仓库访问权限，请添加 Deploy Key 到 Git 仓库的项目或者用户设置')}
      />
    </Section>
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
