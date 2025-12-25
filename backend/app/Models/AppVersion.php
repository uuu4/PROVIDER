<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppVersion extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'version',
        'git_tag',
        'release_notes',
        'changelog',
        'download_url',
        'checksum',
        'is_stable',
        'is_critical',
        'min_php_version',
        'released_at',
        'released_by',
    ];

    protected function casts(): array
    {
        return [
            'is_stable' => 'boolean',
            'is_critical' => 'boolean',
            'released_at' => 'datetime',
        ];
    }

    public function scopeStable($query)
    {
        return $query->where('is_stable', true);
    }

    public function scopeReleased($query)
    {
        return $query->whereNotNull('released_at');
    }

    public static function latest(): ?self
    {
        return static::stable()
            ->released()
            ->orderByDesc('released_at')
            ->first();
    }

    public function isNewerThan(string $version): bool
    {
        return version_compare($this->version, $version, '>');
    }
}
