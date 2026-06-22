<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:test-query-speed')]
#[Description('Command description')]
class TestQuerySpeed extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
    }
}
