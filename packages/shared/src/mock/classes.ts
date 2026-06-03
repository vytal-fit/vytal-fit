import type { Class } from "../types/models";
import { mockClassTypes } from "./class-types";
import { mockLocations } from "./locations";
import { mockCoaches } from "./coaches";

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

export const mockClasses: Class[] = [
  { id: "cl-1", organizationId: "org-1", classTypeId: "ct-1", classType: mockClassTypes[0], locationId: "loc-1", location: mockLocations[0], coachIds: ["coach-1"], coaches: [mockCoaches[0]], date: today, startTime: "07:00", endTime: "08:00", maxCapacity: 20, enrolledCount: 18, waitlistCount: 2 },
  { id: "cl-2", organizationId: "org-1", classTypeId: "ct-1", classType: mockClassTypes[0], locationId: "loc-1", location: mockLocations[0], coachIds: ["coach-2"], coaches: [mockCoaches[1]], date: today, startTime: "09:00", endTime: "10:00", maxCapacity: 20, enrolledCount: 14, waitlistCount: 0 },
  { id: "cl-3", organizationId: "org-1", classTypeId: "ct-2", classType: mockClassTypes[1], locationId: "loc-3", location: mockLocations[2], coachIds: [], coaches: [], date: today, startTime: "10:00", endTime: "11:30", maxCapacity: 15, enrolledCount: 6, waitlistCount: 0 },
  { id: "cl-4", organizationId: "org-1", classTypeId: "ct-3", classType: mockClassTypes[2], locationId: "loc-2", location: mockLocations[1], coachIds: ["coach-3"], coaches: [mockCoaches[2]], date: today, startTime: "12:00", endTime: "13:00", maxCapacity: 12, enrolledCount: 10, waitlistCount: 0 },
  { id: "cl-5", organizationId: "org-1", classTypeId: "ct-1", classType: mockClassTypes[0], locationId: "loc-1", location: mockLocations[0], coachIds: ["coach-1", "coach-4"], coaches: [mockCoaches[0], mockCoaches[3]], date: today, startTime: "17:30", endTime: "18:30", maxCapacity: 20, enrolledCount: 20, waitlistCount: 4 },
  { id: "cl-6", organizationId: "org-1", classTypeId: "ct-1", classType: mockClassTypes[0], locationId: "loc-1", location: mockLocations[0], coachIds: ["coach-2"], coaches: [mockCoaches[1]], date: today, startTime: "18:30", endTime: "19:30", maxCapacity: 20, enrolledCount: 16, waitlistCount: 0 },
  { id: "cl-7", organizationId: "org-1", classTypeId: "ct-4", classType: mockClassTypes[3], locationId: "loc-4", location: mockLocations[3], coachIds: ["coach-3"], coaches: [mockCoaches[2]], date: today, startTime: "19:30", endTime: "20:30", maxCapacity: 30, enrolledCount: 22, waitlistCount: 0 },
  { id: "cl-8", organizationId: "org-1", classTypeId: "ct-5", classType: mockClassTypes[4], locationId: "loc-1", location: mockLocations[0], coachIds: ["coach-1"], coaches: [mockCoaches[0]], date: tomorrow, startTime: "07:00", endTime: "08:00", maxCapacity: 20, enrolledCount: 8, waitlistCount: 0 },
  { id: "cl-9", organizationId: "org-1", classTypeId: "ct-1", classType: mockClassTypes[0], locationId: "loc-1", location: mockLocations[0], coachIds: ["coach-2"], coaches: [mockCoaches[1]], date: tomorrow, startTime: "09:00", endTime: "10:00", maxCapacity: 20, enrolledCount: 5, waitlistCount: 0 },
  { id: "cl-10", organizationId: "org-1", classTypeId: "ct-6", classType: mockClassTypes[5], locationId: "loc-2", location: mockLocations[1], coachIds: ["coach-4"], coaches: [mockCoaches[3]], date: tomorrow, startTime: "12:00", endTime: "13:00", maxCapacity: 12, enrolledCount: 3, waitlistCount: 0 },
];
