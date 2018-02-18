//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { css } from 'glamor';
import React from 'react';
import { connect } from 'react-redux';

import * as constants from '../../../../constants';
import * as ChatActions from '../../../../data/action/chatActions';
import * as EditorActions from '../../../../data/action/editorActions';
import ExpandCollapse, { Controls as ExpandCollapseControls, Content as ExpandCollapseContent } from '../../../layout/expandCollapse';
import * as Colors from '../../../styles/colors';
import ExplorerItem from '../explorerItem';
import { CommandRegistry } from 'botframework-emulator-shared/built/platform/commands/commandRegistry';
import { CommandService } from '../../../../platform/commands/commandService';
import store from '../../../../data/store';

CommandRegistry.registerCommand('livechat:new', (context, activeEditor) => {
  const createAction = ChatActions.newLiveChatDocument();
  store.dispatch(createAction);
  // TODO: Turn this into a saga, the conversation ID maybe generated from server asynchronously
  store.dispatch(EditorActions.open(
    activeEditor,
    constants.ContentType_LiveChat,
    createAction.payload.conversationId
  ));
});

const CSS = css({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  backgroundColor: Colors.EXPLORER_BACKGROUND_DARK,
  color: Colors.EXPLORER_FOREGROUND_DARK,
});

const CONVO_CSS = css({
  display: 'flex',
  flexDirection: 'column',
  listStyleType: 'none',
  margin: 0,
  padding: 0
});

class LiveChatExplorer extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.onAddClick = this.handleAddClick.bind(this);
    this.onItemClick = this.handleItemClick.bind(this);
  }

  handleAddClick(e) {
    e.stopPropagation();
    CommandService.call('livechat:new', this.props.activeEditor);
  }

  handleItemClick(conversationId) {
    this.props.dispatch(EditorActions.setActiveTab(null, conversationId));
  }

  render() {
    return (
      <ul className={CSS}>
        <li>
          <ExpandCollapse
            initialExpanded={true}
            title="Live Chats"
          >
            <ExpandCollapseControls>
              <button onClick={this.onAddClick}>+</button>
            </ExpandCollapseControls>
            <ExpandCollapseContent key={this.props.changeKey}>
              <ul className={CONVO_CSS}>
                {
                  Object.keys(this.props.liveChats).map(conversationId =>
                    <ExplorerItem key={conversationId} active={this.props.activeDocumentId === conversationId} onClick={() => this.onItemClick(conversationId)}>
                      <span>{`Emulator : ${conversationId}`}</span>
                    </ExplorerItem>
                  )
                }
              </ul>
            </ExpandCollapseContent>
          </ExpandCollapse>
        </li>
      </ul>
    );
  }
}

export default connect(state => ({
  activeDocumentId: state.editor.editors[state.editor.activeEditor].activeDocumentId,
  liveChats: state.chat.liveChats,
  changeKey: state.chat.liveChatChangeKey
}))(LiveChatExplorer)