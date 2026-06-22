<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
                    // Map to success if the title/message mentions success or is successful
                    if (str_contains(strtolower($n->title), 'berhasil') || str_contains(strtolower($n->message), 'berhasil')) {
                        $type = 'success';
                    } else {
                        $type = 'info';
                    }
                }

                // Friendly relative time in Indonesian
                $time = $n->created_at ? $n->created_at->diffForHumans() : '';

                return [
                    'id' => $n->id,
                    'title' => $n->title,
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

    /**
     * Create a new notification for the authenticated user (called from frontend).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:500'],
            'type' => ['nullable', 'string'],
        ]);

        // Map frontend type to DB enum (alert/reminder/system)
        $typeMap = [
            'warning' => 'alert',
            'reminder' => 'reminder',
            'success' => 'system',
            'info' => 'system',
        ];
        $dbType = $typeMap[$validated['type'] ?? 'info'] ?? 'alert';

        $notification = Notification::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'] ?? 'Notifikasi Keuangan',
            'message' => $validated['message'],
            'type' => $dbType,
            'is_read' => false,
        ]);

        return response()->json([
            'id' => $notification->id,
            'title' => $notification->title,
            'message' => $notification->message,
            'time' => $notification->created_at->diffForHumans(),
            'type' => $validated['type'] ?? 'warning',
            'read' => false,
        ], 201);
    }
}
