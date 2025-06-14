export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin"],
  "/student(.*)": ["student"],
  "/list/teachers": ["admin", "teacher"],
  "/list/students": ["admin"],
  "/list/students/:id": ["admin"],
  "/list/parents": ["admin", "teacher"],
  "/list/subjects": ["admin"],
  "/list/quizzBuilder": ["admin"],
  "/list/myquiz": ["student"],
  "/list/classes": ["admin", "teacher"],
  "/list/registrations": ["admin"],
  "/list/exams": ["admin", "teacher", "parent"],
  "/list/assignments": ["admin", "teacher", "student", "parent"],
  "/list/results": ["admin", "teacher", "student", "parent"],
  "/list/attendance": ["admin", "teacher", "student", "parent"],
  "/list/events": ["admin", "teacher", "student", "parent"],
  "/list/announcements": ["admin", "teacher", "student", "parent"],
  "/students/:id": ["student"],
};