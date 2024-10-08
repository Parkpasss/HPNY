import prisma from "@/db"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import axios from "axios"
import { Prisma } from "@prisma/client"

// GET 요청 핸들러
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get("page") as string
  const limit = (searchParams.get("limit") as string) || "10"
  const id = searchParams.get("id") as string
  const my = searchParams.get("my") as string
  const location = searchParams.get("location") as string
  const category = searchParams.get("category") as string
  const q = searchParams.get("q") as string
  const sortBy =
    (searchParams.get("sortBy") as keyof typeof orderByOptions) || "createdAt"

  const session = await getServerSession(authOptions)

  // 정렬 옵션 지정
  const orderByOptions = {
    views: { views: Prisma.SortOrder.desc },
    comments: { comments: { _count: Prisma.SortOrder.desc } },
    likes: { likes: { _count: Prisma.SortOrder.desc } },
    bookings: { bookings: { _count: Prisma.SortOrder.desc } },
    createdAt: { createdAt: Prisma.SortOrder.desc },
  }

  if (id) {
    const room = await prisma.room.findFirst({
      where: {
        id: parseInt(id),
      },
      include: {
        likes: {
          where: session ? { userId: session?.user?.id } : {},
        },
        comments: true,
      },
    })
    return NextResponse.json(room, {
      status: 200,
    })
  } else if (my) {
    if (!session?.user) {
      return NextResponse.json(
        { error: "unauthorized user" },
        {
          status: 401,
        },
      )
    }

    const count = await prisma.room.count({
      where: {
        userId: session?.user?.id,
      },
    })
    const skipPage = parseInt(page) - 1

    const rooms = await prisma.room.findMany({
      where: {
        userId: session?.user.id,
        title: q ? { contains: q } : {},
      },
      orderBy: orderByOptions[sortBy],
      take: parseInt(limit),
      skip: skipPage * parseInt(limit),
      include: {
        comments: true,
        likes: true,
        bookings: true,
      },
    })

    const roomsWithCounts = rooms.map((room) => ({
      ...room,
      commentsCount: room.comments.length,
      likesCount: room.likes.length,
      bookingsCount: room.bookings.length,
    }))

    return NextResponse.json(
      {
        page: parseInt(page),
        data: roomsWithCounts,
        totalCount: count,
        totalPage: Math.ceil(count / parseInt(limit)),
      },
      {
        status: 200,
      },
    )
  } else if (page) {
    const count = await prisma.room.count()
    const skipPage = parseInt(page) - 1
    const rooms = await prisma.room.findMany({
      where: {
        address: location ? { contains: location } : {},
        category: category ? category : {},
      },
      orderBy: orderByOptions[sortBy],
      take: parseInt(limit),
      skip: skipPage * parseInt(limit),
      include: {
        comments: true,
        likes: true,
        bookings: true,
      },
    })

    const roomsWithCounts = rooms.map((room) => ({
      ...room,
      commentsCount: room.comments.length,
      likesCount: room.likes.length,
      bookingsCount: room.bookings.length,
    }))

    return NextResponse.json(
      {
        page: parseInt(page),
        data: roomsWithCounts,
        totalCount: count,
        totalPage: Math.ceil(count / parseInt(limit)),
      },
      { status: 200 },
    )
  } else {
    const data = await prisma.room.findMany({
      orderBy: orderByOptions[sortBy],
      include: {
        comments: true,
        likes: true,
        bookings: true,
      },
    })

    const dataWithCounts = data.map((room) => ({
      ...room,
      commentsCount: room.comments.length,
      likesCount: room.likes.length,
      bookingsCount: room.bookings.length,
    }))

    return NextResponse.json(dataWithCounts, {
      status: 200,
    })
  }
}

// POST 요청 핸들러
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized user" }, { status: 401 })
  }

  try {
    const formData = await req.json()

    // 유저가 실제로 존재하는지 확인
    const userExists = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const newRoom = await prisma.room.create({
      data: {
        ...formData,
        userId: session.user.id,
        price: parseInt(formData.price, 10),
        views: 0, // 조회수 초기값 설정
        imageKeys: formData.imageKeys || [],
      },
    })

    return NextResponse.json(newRoom, { status: 200 })
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json(
      { error: "An error occurred while creating the room." },
      { status: 500 },
    )
  }
}
