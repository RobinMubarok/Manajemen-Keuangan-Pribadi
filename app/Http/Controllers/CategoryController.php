<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Return all categories for the current user.
     */
    public function index(): JsonResponse
    {
        $categories = Category::where('user_id', 1)
            ->orderBy('name')
            ->get()
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'type' => ucfirst($c->type),
                'icon' => $c->icon,
                'color' => $c->color,
            ]);

        return response()->json($categories);
    }

    /**
     * Create a new category.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|in:Pemasukan,Pengeluaran',
            'icon' => 'nullable|string|max:10',
            'color' => 'nullable|string|max:7',
        ]);

        $categoryType = strtolower($validated['type']);

        // Check for duplicate name+type for this user
        $exists = Category::where('user_id', 1)
            ->where('name', $validated['name'])
            ->where('type', $categoryType)
            ->exists();

        if ($exists) {
            return response()->json(
                ['message' => 'Kategori dengan nama dan tipe ini sudah ada.'],
                422,
            );
        }

        $category = Category::create([
            'user_id' => 1,
            'name' => $validated['name'],
            'type' => $categoryType,
            'icon' => $validated['icon'] ?? null,
            'color' => $validated['color'] ?? null,
        ]);

        return response()->json([
            'id' => $category->id,
            'name' => $category->name,
            'type' => ucfirst($category->type),
            'icon' => $category->icon,
            'color' => $category->color,
        ], 201);
    }

    /**
     * Delete a category by ID.
     */
    public function destroy(int $id): JsonResponse
    {
        $category = Category::where('user_id', 1)->findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Kategori berhasil dihapus.']);
    }
}
