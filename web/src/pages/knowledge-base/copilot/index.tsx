import { Tabs, Input } from "@arco-design/web-react"
import { Breadcrumb, Button } from "@arco-design/web-react"

// 自定义组件
import { DigestToday } from "@/pages/digest-today"
import { ThreadLibrary } from "@/components/thread-library"

// 自定义组件
import {
  IconApps,
  IconBook,
  IconCaretDown,
  IconDown,
  IconFolder,
  IconHistory,
  IconMessage,
  IconMore,
  IconPlusCircle,
  IconRobot,
  IconTranslate,
} from "@arco-design/web-react/icon"
// 自定义样式
import "./index.scss"
import { fakeConversations } from "@/fake-data/conversation"
import { MessageType } from "@/types"
import { AssistantMessage, HumanMessage } from "./message"
// 自定义组件
import { SearchTargetSelector } from "@/components/search-target-selector"
import { useSearchParams } from "react-router-dom"
import { SearchTarget, useSearchStateStore } from "@/stores/search-state"

const TextArea = Input.TextArea

export const AICopilot = () => {
  const conv = fakeConversations?.[0]

  return (
    <div className="ai-copilot-container">
      <div className="knowledge-base-detail-header">
        <div className="knowledge-base-detail-navigation-bar">
          <div className="conv-meta">
            <IconMessage style={{ color: "rgba(0, 0, 0, .6)" }} />
            <p className="conv-title">elmo chat 和 devv 比较如何？</p>
          </div>
        </div>
        <div className="knowledge-base-detail-menu">
          <Button
            type="text"
            icon={<IconMore style={{ fontSize: 16 }} />}></Button>
        </div>
      </div>
      <div className="ai-copilot-message-container">
        {conv?.messages?.map((item, index) =>
          item.type === MessageType.Human ? (
            <HumanMessage message={item} key={index} />
          ) : (
            <AssistantMessage message={item} key={index} />
          ),
        )}
      </div>
      <div className="ai-copilot-body">
        <div className="ai-copilot-context-display"></div>
        <div className="ai-copilot-chat-container">
          <div className="chat-setting-container">
            <div className="chat-operation-container">
              <Button
                icon={<IconBook />}
                type="text"
                className="chat-input-assist-action-item">
                快速总结
              </Button>
            </div>
            <div className="conv-operation-container">
              <Button
                icon={<IconHistory />}
                type="text"
                className="chat-input-assist-action-item">
                会话历史
              </Button>
              <Button
                icon={<IconPlusCircle />}
                type="text"
                className="chat-input-assist-action-item">
                新会话
              </Button>
            </div>
          </div>

          <div className="skill-container">
            {["搜索", "写作", "翻译", "数据分析", "更多技能"].map(
              (item, index) => (
                <div key={index} className="skill-item">
                  {item}
                </div>
              ),
            )}
          </div>
          <div className="chat-input-container">
            <div className="chat-input-body">
              <TextArea
                placeholder="提出问题，发现新知"
                autoSize={{ minRows: 3, maxRows: 3 }}
              />
            </div>
            <div className="chat-input-assist-action">
              <SearchTargetSelector classNames="chat-input-assist-action-item" />
              <Button
                icon={<IconTranslate />}
                type="text"
                className="chat-input-assist-action-item">
                <span>简体中文</span>
                <IconCaretDown />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
