"use client"

import { Dialog, Transition } from "@headlessui/react"
import React, { Fragment, useRef } from "react"
import { AiOutlineClose } from "react-icons/ai"
import axios from "axios"
import { useInfiniteQuery } from "react-query"
import { CommentApiType, CommentType } from "@/interface"
import useIntersectionObserver from "@/hooks/useIntersectionObserver"
import { Loader } from "../Loader"
import dayjs from "dayjs"
import "dayjs/locale/ko"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

export default function CommentListModal({
  isOpen,
  closeModal,
  activityId,
  roomId,
  selectedComment,
}: {
  isOpen: boolean
  closeModal: () => void
  activityId: number
  roomId: number
  selectedComment: CommentType | null
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const pageRef = useIntersectionObserver(ref, {
    rootMargin: "10%",
    enableObserver: !!ref.current,
  })
  const isPageEnd = !!pageRef?.isIntersecting

  const fetchComments = async ({ pageParam = 1 }) => {
    let url = `/api/comments?limit=6&page=${pageParam}`
    if (roomId) url += `&roomId=${roomId}`
    if (activityId) url += `&activityId=${activityId}`
    const { data } = await axios(url)
    return data as CommentApiType
  }

  const {
    data: comments,
    fetchNextPage,
    isFetching,
    hasNextPage,
  } = useInfiniteQuery(
    `comments-${activityId}-${roomId}-infinite`,
    fetchComments,
    {
      getNextPageParam: (lastPage: any) =>
        lastPage?.data?.length > 0 ? lastPage.page + 1 : undefined,
      enabled: !selectedComment,
    },
  )

  React.useEffect(() => {
    if (isPageEnd && hasNextPage) {
      fetchNextPage()
    }
  }, [isPageEnd, hasNextPage, fetchNextPage])

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full p-2 hover:bg-black/5 mb-4"
                >
                  <AiOutlineClose />
                </button>
                <Dialog.Title
                  as="h3"
                  className="text-xl md:text-2xl font-medium leading-6 text-gray-900"
                >
                  {selectedComment ? "후기 상세 보기" : "후기 전체 보기"}
                </Dialog.Title>
                <div className="mt-8 flex flex-col gap-8 mx-auto max-w-lg mb-10">
                  {selectedComment ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 items-center">
                        <img
                          src={
                            selectedComment.user?.image || "/images/user.png"
                          }
                          alt="profile img"
                          width={50}
                          height={50}
                          className="rounded-full"
                        />
                        <div>
                          <h1 className="font-semibold">
                            {selectedComment.user?.name || "-"}
                          </h1>
                          <div className="text-gray-500 text-xs">
                            {dayjs(selectedComment.createdAt)
                              .tz(dayjs.tz.guess())
                              .format("YYYY-MM-DD HH:mm:ss")}
                          </div>
                        </div>
                      </div>
                      <div className="max-w-lg text-gray-600">
                        {selectedComment.body}
                      </div>
                    </div>
                  ) : (
                    comments?.pages?.map((page, index) => (
                      <React.Fragment key={index}>
                        {page.data.map((comment: CommentType) => (
                          <div
                            key={comment?.id}
                            className="flex flex-col gap-2"
                          >
                            <div className="flex gap-2 items-center">
                              <img
                                src={comment?.user?.image || "/images/user.png"}
                                alt="profile img"
                                width={50}
                                height={50}
                                className="rounded-full"
                              />
                              <div>
                                <h1 className="font-semibold">
                                  {comment?.user?.name || "-"}
                                </h1>
                                <div className="text-gray-500 text-xs">
                                  {dayjs(comment?.createdAt)
                                    .tz(dayjs.tz.guess())
                                    .format("YYYY-MM-DD HH:mm:ss")}
                                </div>
                              </div>
                            </div>
                            <div className="max-w-lg text-gray-600">
                              {comment?.body}
                            </div>
                          </div>
                        ))}
                      </React.Fragment>
                    ))
                  )}
                  {!selectedComment && (hasNextPage || isFetching) && (
                    <Loader className="mt-8" />
                  )}
                  {!selectedComment && (
                    <div
                      ref={ref}
                      className="w-full h-10 mb-10 z-10 touch-none"
                    />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
