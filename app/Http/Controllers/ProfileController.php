<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile details.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'date_of_birth' => $user->date_of_birth,
            'gender' => $user->gender,
            'photo_url' => $user->photo_url,
        ]);
    }

    /**
     * Update the authenticated user's profile info.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', Rule::in(['Male', 'Female'])],
        ]);

        $user->first_name = $validated['first_name'] ?? null;
        $user->last_name = $validated['last_name'] ?? null;
        $user->email = $validated['email'];
        $user->date_of_birth = $validated['date_of_birth'] ?? null;
        $user->gender = $validated['gender'] ?? null;

        // Sync name to first_name + last_name
        $fullName = trim(($validated['first_name'] ?? '').' '.($validated['last_name'] ?? ''));
        if ($fullName !== '') {
            $user->name = $fullName;
        }

        $user->save();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'date_of_birth' => $user->date_of_birth,
            'gender' => $user->gender,
            'photo_url' => $user->photo_url,
        ]);
    }

    /**
     * Upload and update the authenticated user's profile photo.
     */
    public function updatePhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        $user = $request->user();

        if ($request->hasFile('photo')) {
            // Delete old photo if it exists locally
            if ($user->photo_url) {
                $oldPath = public_path(ltrim($user->photo_url, '/'));
                if (file_exists($oldPath) && is_file($oldPath)) {
                    @unlink($oldPath);
                }
            }

            // Store new photo directly to public/profile-photos
            $file = $request->file('photo');
            $filename = time().'_'.$file->getClientOriginalName();
            $file->move(public_path('profile-photos'), $filename);

            $user->photo_url = '/profile-photos/'.$filename;
            $user->save();
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'dob' => $user->dob,
            'gender' => $user->gender,
            'photo_url' => $user->photo_url,
        ]);
    }
}
