export interface ICourseMonitoringStudent {
  userId: string;
  name: string;
  email?: string;
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
}

export interface ICourseMonitoring {
  courseId: string;
  enrolledCount: number;
  completedStudents: number;
  completionRate: number;
  averageProgress: number;
  totalLessons: number;
  topStudents?: ICourseMonitoringStudent[];
}
