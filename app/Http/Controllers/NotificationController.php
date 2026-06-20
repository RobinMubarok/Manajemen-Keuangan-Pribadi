<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Retrieve notifications for the authenticated user.
     */
    public function index(): JsonResponse
    {
        Carbon::setLocale('id');

        $notifications = Notification::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Notification $n) {
                // Map database type to frontend type
                $type = 'info';
                if ($n->type === 'alert') {
                    $type = 'warning';
                } elseif ($n->type === 'reminder') {
                    $type = 'reminder';
                } elseif ($n->type === 'system') {
                    $type = 'success';
                }

                // Friendly relative time in Indonesian
                $time = $n->created_at ? $n->created_at->diffForHumans() : '';

                return [
                    'id' => $n->id,
                    'message' => $n->message,
                    'time' => $time,
                    'type' => $type,
                    'read' => $n->is_read,
                ];
            });

        return response()->json($notifications);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(int $id): JsonResponse
    {
        $notification = Notification::where('user_id', auth()->id())->findOrFail($id);
        $notification->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead(): JsonResponse
    {
        Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }
}
