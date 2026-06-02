import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly stats: StatisticsService) {}

  @Get('overview')
  async overview() {
    return this.stats.getOverview();
  }

  @Get('revenue')
  async revenue(
    @Query('period') period: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.stats.getRevenueStatistics(period || 'month', start, end);
  }

  @Get('revenue/monthly-chart')
  async revenueMonthlyChart(@Query('year') year?: string) {
    const y = year ? parseInt(year) : new Date().getFullYear();
    return this.stats.getMonthlyRevenueChart(y);
  }

  @Get('courses/top')
  async topCourses(
    @Query('type') type?: string,
    @Query('limit') limit?: string,
  ) {
    const lim = limit ? parseInt(limit) : 10;
    return this.stats.getTopCourses(type || 'revenue', lim);
  }

  @Get('courses/completion-rate')
  async courseCompletionRates(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit) : 20;
    return this.stats.getCourseCompletionRates(lim);
  }

  @Get('students/new')
  async newStudents(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.stats.getNewStudents(start, end);
  }

  @Get('students/active')
  async activeStudents(
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.stats.getActiveStudents(start, end);
  }

  @Get('students/progress')
  async studentsProgress() {
    return this.stats.getStudentsProgressOverview();
  }

  @Get('orders/summary')
  async orderSummary() {
    return this.stats.getOrderSummary();
  }

  @Get('orders/by-payment-method')
  async ordersByPaymentMethod() {
    return this.stats.getRevenueByPaymentMethod();
  }

  @Get('videos/overview')
  async videosOverview() {
    return this.stats.getVideoOverview();
  }

  @Get('videos/top-watched')
  async videosTopWatched(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit) : 10;
    return this.stats.getTopWatchedVideos(lim);
  }

  @Get('videos/completion-rate')
  async videosCompletionRate() {
    return this.stats.getVideoCompletionRate();
  }
}
