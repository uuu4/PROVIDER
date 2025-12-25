<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LicenseValidation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'license_id',
        'ip_address',
        'user_agent',
        'domain',
        'app_version',
        'php_version',
        'status',
        'response',
        'error_message',
        'validated_at',
    ];

    protected function casts(): array
    {
        return [
            'validated_at' => 'datetime',
        ];
    }

    public function license(): BelongsTo
    {
        return $this->belongsTo(License::class);
    }

    public function isSuccess(): bool
    {
        return $this->status === 'success';
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', '!=', 'success');
    }

    public function scopeRecent($query, int $hours = 24)
    {
        return $query->where('validated_at', '>=', now()->subHours($hours));
    }
}
