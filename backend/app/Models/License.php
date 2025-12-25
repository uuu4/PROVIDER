<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class License extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'tenant_id',
        'license_key',
        'plan',
        'status',
        'max_users',
        'max_products',
        'starts_at',
        'expires_at',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'max_users' => 'integer',
            'max_products' => 'integer',
            'starts_at' => 'date',
            'expires_at' => 'date',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (License $license) {
            if (empty($license->license_key)) {
                $license->license_key = self::generateLicenseKey();
            }
        });
    }

    public static function generateLicenseKey(): string
    {
        $segments = [];
        for ($i = 0; $i < 4; $i++) {
            $segments[] = strtoupper(Str::random(4));
        }
        return 'SAAS-' . implode('-', $segments);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function validations(): HasMany
    {
        return $this->hasMany(LicenseValidation::class);
    }

    public function isValid(): bool
    {
        return $this->status === 'active' 
            && $this->expires_at->isFuture()
            && $this->starts_at->isPast();
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isExpiringSoon(int $days = 30): bool
    {
        return $this->expires_at->isBetween(now(), now()->addDays($days));
    }

    public function daysUntilExpiration(): int
    {
        return (int) now()->diffInDays($this->expires_at, false);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')
            ->where('expires_at', '>=', now())
            ->where('starts_at', '<=', now());
    }

    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->where('status', 'active')
            ->whereBetween('expires_at', [now(), now()->addDays($days)]);
    }
}
