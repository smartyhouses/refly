/**
 * 只聚焦昨天、今天、这周、这个月最核心的内容，剩下的让用户去归档里面查看，能够对自己的工作有一个明确的感知
 */

import { time } from "@/utils/time"
import {
  List,
  Skeleton,
  Typography,
  Message as message,
} from "@arco-design/web-react"
import {
  IconClockCircle,
  IconLink,
  IconRightCircle,
  IconShareExternal,
  IconTag,
} from "@arco-design/web-react/icon"
import { useNavigate } from "react-router-dom"
// types
import type { Digest } from "@/types/digest"
import { IconTip } from "@/components/dashboard/icon-tip"
import { copyToClipboard } from "@/utils"
import { getClientOrigin, safeParseURL } from "@/utils/url"
// components
import { useEffect, useState } from "react"
import { EmptyDigestStatus } from "@/components/empty-digest-today-status"
// utils
import getKnowledgeBaseList from "@/requests/getKnowledgeBaseList"
// styles
import "./index.scss"
import { CollectionListItem, LOCALE, Source } from "@/types"
import { useTranslation } from "react-i18next"
import { useKnowledgeBaseStore } from "@/stores/knowledge-base"

export const getFirstSourceLink = (sources: Source[]) => {
  return sources?.[0]?.metadata?.source
}

export const KnowledgeBaseList = () => {
  const navigate = useNavigate()
  const knowledgeBaseStore = useKnowledgeBaseStore()
  const [scrollLoading, setScrollLoading] = useState(
    <Skeleton animation style={{ width: "100%" }}></Skeleton>,
  )
  const [isFetching, setIsFetching] = useState(false)
  const { t, i18n } = useTranslation()
  const language = i18n.languages?.[0]

  const fetchData = async (currentPage = 1) => {
    let newData: CollectionListItem[] = []

    try {
      setScrollLoading(
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}>
          <Skeleton animation style={{ width: "100%" }}></Skeleton>
          <Skeleton
            animation
            style={{ width: "100%", marginTop: 24 }}></Skeleton>
        </div>,
      )

      if (!knowledgeBaseStore.hasMore && currentPage !== 1) {
        setScrollLoading(
          <span>{t("knowledgeLibrary.archive.item.noMoreText")}</span>,
        )

        return
      }

      const newRes = await getKnowledgeBaseList({
        body: {
          // TODO: confirm time filter
          page: currentPage,
          pageSize: knowledgeBaseStore.pageSize,
        },
      })

      if (!newRes?.success) {
        throw new Error(newRes?.errMsg)
      }

      console.log("newRes", newRes)
      newData = knowledgeBaseStore.knowledgeBaseList.concat(newRes?.data || [])
      knowledgeBaseStore.updateKnowledgeBaseList(newData)
    } catch (err) {
      message.error(t("knowledgeLibrary.archive.list.fetchErr"))
    } finally {
      const { knowledgeBaseList, pageSize } = useKnowledgeBaseStore.getState()

      if (knowledgeBaseList?.length === 0) {
        setScrollLoading(<EmptyDigestStatus />)
      } else if (newData?.length >= 0 && newData?.length < pageSize) {
        setScrollLoading(
          <span>{t("knowledgeLibrary.archive.item.noMoreText")}</span>,
        )
      }
    }
  }

  useEffect(() => {
    fetchData()

    return () => {
      knowledgeBaseStore.resetState()
    }
  }, [])

  return (
    <div className="today-container knowledge-base-list-container">
      <div className="today-feature-container">
        {/* <div className="today-block-header"> */}
        {/* <div className="header-title">今天浏览内容总结</div> */}
        {/* <div className="header-switch">
            <span className="header-featured">精选</span>
            <span className="header-all">全部</span>
          </div> */}
        {/* </div> */}
        <List
          className="digest-list knowledge-base-list"
          wrapperStyle={{ width: "100%" }}
          bordered={false}
          pagination={false}
          offsetBottom={200}
          // header={
          //   <p className="today-header-title">
          //     {t("knowledgeLibrary.archive.title")}
          //   </p>
          // }
          dataSource={knowledgeBaseStore.knowledgeBaseList || []}
          scrollLoading={scrollLoading}
          onReachBottom={currentPage => fetchData(currentPage)}
          render={(item: CollectionListItem) => (
            <List.Item
              key={item?.collectionId}
              style={{
                padding: "20px 0",
                borderBottom: "1px solid var(--color-fill-3)",
              }}
              className="knowledge-base-list-item-container"
              actionLayout="vertical"
              onClick={() => {
                navigate(`/knowledge-base?kbId=${item?.collectionId}`)
              }}
              actions={[
                <div className="feed-item-action-container knowledge-base-list-item-action-container">
                  <div className="feed-item-action">
                    <span
                      key={1}
                      className="feed-list-item-continue-ask with-border with-hover knowledge-base-list-see-item"
                      onClick={() => {
                        navigate(`/knowledge-base?kbId=${item?.collectionId}`)
                      }}>
                      <IconRightCircle
                        style={{ fontSize: 14, color: "#64645F" }}
                      />
                      <span className="knowledge-base-list-see-item-text">
                        查看知识库
                      </span>
                    </span>
                    <IconTip text={t("knowledgeLibrary.archive.item.copy")}>
                      <span
                        key={1}
                        className="feed-list-item-continue-ask"
                        onClick={() => {
                          copyToClipboard(
                            `${getClientOrigin()}/knowledge-base?kbId=${item?.collectionId}`,
                          )
                          message.success(
                            t("knowledgeLibrary.archive.item.copyNotify"),
                          )
                        }}>
                        <IconShareExternal
                          style={{ fontSize: 14, color: "#64645F" }}
                        />
                        <span className="feed-list-item-text">
                          {t("knowledgeLibrary.archive.item.share")}
                        </span>
                      </span>
                    </IconTip>
                  </div>
                  <div className="feed-item-action" style={{ marginTop: 8 }}>
                    <span key={3}>
                      <IconClockCircle
                        style={{ fontSize: 14, color: "#64645F" }}
                      />
                      <span className="feed-list-item-text">
                        {time(item.updatedAt, language as LOCALE)
                          .utc()
                          .fromNow()}
                      </span>
                    </span>
                  </div>
                </div>,
              ]}>
              <List.Item.Meta
                title={item.title}
                description={
                  <Typography.Paragraph
                    ellipsis={{
                      rows: 2,
                      wrapper: "span",
                    }}
                    style={{ color: "rgba(0, 0, 0, .4) !important" }}>
                    {item.description}
                  </Typography.Paragraph>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}
