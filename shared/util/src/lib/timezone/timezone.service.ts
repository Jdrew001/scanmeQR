// libs/shared/util/src/lib/timezone/timezone.service.ts
import { Injectable, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { UsersService } from '../../../../services/src/lib/users/users.service';

@Injectable({ scope: Scope.REQUEST })
export class TimezoneService {
  private timezone: string = 'UTC';
  private initialized = false;

  constructor(
    @Inject(REQUEST) private request: any,
    private usersService: UsersService
  ) {}

  // Lazy-load the timezone when first needed
  private async initializeTimezone(): Promise<void> {
    if (this.initialized) return;

    // 1. Try to get from query parameter first (highest priority)
    if (this.request.query?.timezone) {
      this.timezone = this.request.query.timezone;
      this.initialized = true;
      return;
    }

    // 2. Try to get from request.user if available
    if (this.request.user?.timezone) {
      this.timezone = this.request.user.timezone;
      this.initialized = true;
      return;
    }

    // 3. If we have a user ID but no timezone, fetch from database
    if (this.request.user?.id) {
      try {
        const user = await this.usersService.findOne(this.request.user.id);
        if (user?.timezone) {
          this.timezone = user.timezone;
          this.initialized = true;
          return;
        }
      } catch (error) {
        console.error('Failed to fetch user timezone:', error);
      }
    }

    // 5. Default to UTC if all else fails
    this.timezone = 'UTC';
    this.initialized = true;
  }

  // Make all public methods async to ensure timezone is initialized
  async getUserTimezone(): Promise<string> {
    await this.initializeTimezone();
    return this.timezone;
  }

  async setToStartOfDay(date: Date): Promise<Date> {
    await this.initializeTimezone();

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = formatter.formatToParts(date);
    const year = parts.find(part => part.type === 'year')?.value;
    const month = parts.find(part => part.type === 'month')?.value;
    const day = parts.find(part => part.type === 'day')?.value;

    return new Date(`${year}-${month}-${day}T00:00:00`);
  }

  async setToEndOfDay(date: Date): Promise<Date> {
    await this.initializeTimezone();

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = formatter.formatToParts(date);
    const year = parts.find(part => part.type === 'year')?.value;
    const month = parts.find(part => part.type === 'month')?.value;
    const day = parts.find(part => part.type === 'day')?.value;

    return new Date(`${year}-${month}-${day}T23:59:59.999`);
  }

  async parseDate(dateString: string, options: { endOfDay?: boolean } = {}): Promise<Date> {
    if (!dateString) {
      throw new Error('Date string is required');
    }

    let result: Date;

    // Check if it's a relative date format
    if (dateString.endsWith('d') || dateString.endsWith('w') || dateString.endsWith('m')) {
      result = await this.parseRelativeDate(dateString);
    } else if (dateString.toLowerCase() === 'today') {
      result = new Date();
    } else {
      // Regular date
      result = new Date(dateString);
      if (isNaN(result.getTime())) {
        throw new Error(`Invalid date format: ${dateString}`);
      }
    }

    // Set to start or end of day in the user's timezone
    return options.endOfDay
      ? await this.setToEndOfDay(result)
      : await this.setToStartOfDay(result);
  }

  async formatDate(date: Date, format: 'short' | 'medium' | 'long' = 'medium'): Promise<string> {
    await this.initializeTimezone();

    const options: Intl.DateTimeFormatOptions = {
      timeZone: this.timezone,
    };

    switch (format) {
      case 'short':
        Object.assign(options, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        break;
      case 'medium':
        Object.assign(options, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        break;
      case 'long':
        Object.assign(options, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long'
        });
        break;
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  async getDateComponents(date: Date): Promise<{ year: number, month: number, day: number, dayOfWeek: number }> {
    await this.initializeTimezone();

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    });

    const parts = formatter.formatToParts(date);
    const year = parseInt(parts.find(part => part.type === 'year')?.value || '0');
    const month = parseInt(parts.find(part => part.type === 'month')?.value || '0');
    const day = parseInt(parts.find(part => part.type === 'day')?.value || '0');

    // Create a date object to get day of week
    const localDate = new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T12:00:00`);
    const dayOfWeek = localDate.getDay();

    return { year, month, day, dayOfWeek };
  }

  async getFirstDayOfWeek(date: Date): Promise<Date> {
    const components = await this.getDateComponents(date);
    const localDate = new Date(`${components.year}-${components.month.toString().padStart(2, '0')}-${components.day.toString().padStart(2, '0')}T12:00:00`);

    // Get the first day of the week (Sunday)
    const result = new Date(localDate);
    result.setDate(localDate.getDate() - components.dayOfWeek);

    return this.setToStartOfDay(result);
  }

  async getFirstDayOfMonth(date: Date): Promise<Date> {
    const components = await this.getDateComponents(date);
    return this.setToStartOfDay(new Date(`${components.year}-${components.month.toString().padStart(2, '0')}-01T00:00:00`));
  }

  private async parseRelativeDate(relativeDate: string): Promise<Date> {
    const now = new Date();

    if (relativeDate.endsWith('d')) {
      // Days ago
      const days = parseInt(relativeDate.slice(0, -1));
      if (isNaN(days)) {
        throw new Error(`Invalid relative date format: ${relativeDate}`);
      }
      const result = new Date(now);
      result.setDate(result.getDate() - days);
      return result;
    } else if (relativeDate.endsWith('w')) {
      // Weeks ago
      const weeks = parseInt(relativeDate.slice(0, -1));
      if (isNaN(weeks)) {
        throw new Error(`Invalid relative date format: ${relativeDate}`);
      }
      const result = new Date(now);
      result.setDate(result.getDate() - (weeks * 7));
      return result;
    } else if (relativeDate.endsWith('m')) {
      // Months ago
      const months = parseInt(relativeDate.slice(0, -1));
      if (isNaN(months)) {
        throw new Error(`Invalid relative date format: ${relativeDate}`);
      }
      const result = new Date(now);
      result.setMonth(result.getMonth() - months);
      return result;
    }

    throw new Error(`Unrecognized relative date format: ${relativeDate}`);
  }
}
