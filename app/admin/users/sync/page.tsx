"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { syncUsersFromClerk } from "../../actions";

export default function SyncUsersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    totalUsers: number;
    syncedUsers: number;
    failedUsers: number;
    failedUserIds: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setResult(null);

      const syncResult = await syncUsersFromClerk();
      setResult(syncResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-6'>Sync Users from Clerk</h1>
      <p className='text-gray-500 mb-8'>
        This tool will fetch all users from Clerk and sync them to our database.
        This process may take some time depending on the number of users.
      </p>

      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>Sync Users</CardTitle>
          <CardDescription>
            Start the synchronization process to ensure all Clerk users are in
            our database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-gray-500 mb-4'>This process will:</p>
          <ul className='list-disc pl-5 mb-4 text-sm text-gray-500 space-y-1'>
            <li>Fetch all users from Clerk in batches</li>
            <li>Create or update user records in our database</li>
            <li>Report on successful and failed synchronizations</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSync}
            disabled={isLoading}
            className='w-full sm:w-auto'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Syncing Users...
              </>
            ) : (
              "Sync Users from Clerk"
            )}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant='destructive' className='mb-6'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <CheckCircle2 className='h-5 w-5 mr-2 text-green-500' />
              Sync Completed
            </CardTitle>
            <CardDescription>
              The synchronization process has completed. See the results below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <p className='text-sm text-gray-500'>Total Users</p>
                <p className='text-2xl font-bold'>{result.totalUsers}</p>
              </div>
              <div className='bg-green-50 p-4 rounded-lg'>
                <p className='text-sm text-green-600'>Successfully Synced</p>
                <p className='text-2xl font-bold text-green-600'>
                  {result.syncedUsers}
                </p>
              </div>
              <div className='bg-red-50 p-4 rounded-lg'>
                <p className='text-sm text-red-600'>Failed to Sync</p>
                <p className='text-2xl font-bold text-red-600'>
                  {result.failedUsers}
                </p>
              </div>
            </div>

            {result.failedUsers > 0 && (
              <div>
                <h3 className='text-sm font-medium mb-2'>Failed User IDs:</h3>
                <div className='bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto'>
                  <code className='text-xs'>
                    {result.failedUserIds.join(", ")}
                  </code>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
