import { Card } from "@/components/ui/card";
import {
  getVideoAnalytics,
  getRevenueAnalytics,
  getCreditAnalytics,
  getRecentActivity,
  type Activity,
} from "../actions";
import { format } from "date-fns";
import {
  Activity as ActivityIcon,
  Clock,
  CreditCard,
  Video,
} from "lucide-react";

export async function UserStats() {
  return (
    <Card className='p-6'>
      <h2 className='text-2xl font-semibold mb-4'>User Statistics</h2>
      <UserStats />
    </Card>
  );
}

export async function VideoAnalytics() {
  const data = await getVideoAnalytics();

  return (
    <Card className='p-6'>
      <h2 className='text-2xl font-semibold mb-4'>Video Analytics</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Videos
          </h3>
          <p className='text-2xl font-bold'>
            {data.processingStats.total.toLocaleString()}
          </p>
        </div>
        <div>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Success Rate
          </h3>
          <p className='text-2xl font-bold'>
            {(
              (data.processingStats.success / data.processingStats.total) *
              100
            ).toFixed(1)}
            %
          </p>
        </div>
        <div>
          <h3 className='text-sm font-medium text-muted-foreground'>
            In Progress
          </h3>
          <p className='text-2xl font-bold'>
            {data.processingStats.inProgress}
          </p>
        </div>
      </div>
    </Card>
  );
}

export async function RevenueAnalytics() {
  const data = await getRevenueAnalytics();

  return (
    <Card className='p-6'>
      <h2 className='text-2xl font-semibold mb-4'>Revenue Analytics</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Revenue
          </h3>
          <p className='text-2xl font-bold'>
            ${data.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Active Subscriptions
          </h3>
          <p className='text-2xl font-bold'>{data.subscriptionStats.active}</p>
        </div>
        <div>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Monthly Growth
          </h3>
          <p className='text-2xl font-bold'>
            {data.monthlyRevenue[
              data.monthlyRevenue.length - 1
            ]?.amount.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}

export async function CreditAnalytics() {
  const data = await getCreditAnalytics();

  return (
    <Card className='p-6'>
      <h2 className='text-2xl font-semibold mb-4'>Credit Analytics</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Total Credits Used
          </h3>
          <p className='text-2xl font-bold'>
            {data.totalCredits.toLocaleString()}
          </p>
        </div>
        <div>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Average Daily Usage
          </h3>
          <p className='text-2xl font-bold'>
            {(data.totalCredits / data.dailyCredits.length).toFixed(0)}
          </p>
        </div>
        <div>
          <h3 className='text-sm font-medium text-muted-foreground'>
            Top User Usage
          </h3>
          <p className='text-2xl font-bold'>
            {data.topUsers[0]?.credits.toLocaleString() || 0}
          </p>
        </div>
      </div>
    </Card>
  );
}

export async function RecentActivity() {
  const data = await getRecentActivity();

  return (
    <Card className='p-6'>
      <h2 className='text-2xl font-semibold mb-4'>Recent Activity</h2>
      <div className='space-y-4'>
        {data.map((activity: Activity) => (
          <div
            key={activity.id}
            className='flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors'
          >
            {/* Icon based on activity type */}
            <div className='p-2 rounded-full bg-primary/10'>
              {activity.type === "video" && (
                <Video className='w-4 h-4 text-primary' />
              )}
              {activity.type === "subscription" && (
                <CreditCard className='w-4 h-4 text-primary' />
              )}
              {activity.type === "credit" && (
                <ActivityIcon className='w-4 h-4 text-primary' />
              )}
            </div>

            {/* Activity details */}
            <div className='flex-1'>
              <p className='text-sm font-medium'>{activity.description}</p>
              <p className='text-xs text-muted-foreground'>
                {activity.user.email}
              </p>
            </div>

            {/* Timestamp */}
            <div className='flex items-center text-muted-foreground'>
              <Clock className='w-3 h-3 mr-1' />
              <span className='text-xs'>
                {format(new Date(activity.createdAt), "MMM d, h:mma")}
              </span>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className='text-center py-6 text-muted-foreground'>
            No recent activity
          </div>
        )}
      </div>
    </Card>
  );
}
