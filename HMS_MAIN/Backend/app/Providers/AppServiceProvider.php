<?php

namespace App\Providers;

use App\Services\DateService;
use App\Models\StudentFinancial;
use App\Models\StudentCheckInCheckOut;
use App\Models\Complain;
use App\Models\Notice;
use App\Observers\StudentFinancialObserver;
use App\Observers\StudentCheckInCheckOutObserver;
use App\Observers\ComplainObserver;
use App\Observers\NoticeObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(DateService::class, function ($app) {
            return new DateService();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers for automatic email notifications
        StudentFinancial::observe(StudentFinancialObserver::class);
        StudentCheckInCheckOut::observe(StudentCheckInCheckOutObserver::class);
        Complain::observe(ComplainObserver::class);
        Notice::observe(NoticeObserver::class);
    }
}
