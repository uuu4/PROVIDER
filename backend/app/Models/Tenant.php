<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'company_name',
        'domain',
        'contact_name',
        'contact_email',
        'contact_phone',
        'address',
        'timezone',
        'is_active',
        'settings',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'settings' => 'array',
        ];
    }

    public function licenses(): HasMany
    {
        return $this->hasMany(License::class);
    }

    public function activeLicense(): ?License
    {
        return $this->licenses()
            ->where('status', 'active')
            ->where('expires_at', '>=', now())
            ->orderByDesc('expires_at')
            ->first();
    }

    public function isActive(): bool
    {
        return $this->is_active && $this->activeLicense() !== null;
    }
}
