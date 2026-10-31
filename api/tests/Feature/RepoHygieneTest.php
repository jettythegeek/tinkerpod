<?php

declare(strict_types=1);

namespace Tests\Feature;

use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class RepoHygieneTest extends TestCase
{
    private function repoRoot(): string
    {
        return dirname(base_path());
    }

    public function test_no_old_project_code_or_forbidden_directories_exist_in_repo(): void
    {
        $root = $this->repoRoot();

        $forbiddenRootDirs = [
            'mobile',
            'web',
            'landing',
            '.next',
            '.qoder',
        ];

        foreach ($forbiddenRootDirs as $dir) {
            $this->assertDirectoryDoesNotExist(
                $root.DIRECTORY_SEPARATOR.$dir,
                "Forbidden legacy directory '{$dir}' must not exist at repository root."
            );
        }

        $referenceDir = $root.DIRECTORY_SEPARATOR.'docs'.DIRECTORY_SEPARATOR.'reference';
        $this->assertDirectoryExists($referenceDir);

        $allowedReferenceExtensions = ['md', 'txt', 'yaml', 'yml'];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($referenceDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        /** @var SplFileInfo $file */
        foreach ($iterator as $file) {
            if (! $file->isFile()) {
                continue;
            }

            $ext = strtolower($file->getExtension());
            $this->assertContains(
                $ext,
                $allowedReferenceExtensions,
                "docs/reference must contain documentation files only; found: {$file->getPathname()}"
            );
        }

        // Verify no legacy services or unimplemented M5 billing models exist in api/app
        $legacyPhpClasses = [
            base_path('app/Models/Plan.php'),
            base_path('app/Models/Subscription.php'),
            base_path('app/Services/PaystackService.php'),
            base_path('app/Services/PodRecommendationService.php'),
        ];

        foreach ($legacyPhpClasses as $legacyPath) {
            $this->assertFileDoesNotExist(
                $legacyPath,
                "Legacy file '{$legacyPath}' must not exist in M0 fresh-start scaffold."
            );
        }
    }

    public function test_no_env_or_bootstrap_cache_php_files_are_tracked_in_git(): void
    {
        $process = new Process(['git', 'ls-files'], $this->repoRoot());
        $process->mustRun();

        $trackedFiles = array_filter(explode("\n", trim($process->getOutput())));

        foreach ($trackedFiles as $file) {
            $normalized = str_replace('\\', '/', trim($file));

            if (str_ends_with($normalized, '.env.example')) {
                continue;
            }

            $this->assertDoesNotMatchRegularExpression(
                '/(^|\/)\.env(\..+)?$/',
                $normalized,
                "Environment file '{$normalized}' must never be tracked in Git."
            );

            $this->assertDoesNotMatchRegularExpression(
                '/bootstrap\/cache\/.+\.php$/',
                $normalized,
                "Bootstrap cache file '{$normalized}' must never be tracked in Git."
            );
        }
    }

    public function test_design_manifest_checksums_match_all_files_in_design_directory(): void
    {
        $root = $this->repoRoot();
        $manifestPath = $root.DIRECTORY_SEPARATOR.'design'.DIRECTORY_SEPARATOR.'MANIFEST.md';

        $this->assertFileExists($manifestPath);

        $manifestContent = (string) file_get_contents($manifestPath);
        preg_match_all(
            '/^\|\s*`(design\/[^`]+)`\s*\|\s*(\d+)\s*\|\s*`([a-f0-9]{64})`\s*\|/m',
            $manifestContent,
            $matches,
            PREG_SET_ORDER
        );

        $this->assertNotEmpty($matches, 'design/MANIFEST.md must contain file checksum entries.');

        $manifestMap = [];
        foreach ($matches as $match) {
            $manifestMap[$match[1]] = [
                'bytes' => (int) $match[2],
                'sha256' => $match[3],
            ];
        }

        $designDir = $root.DIRECTORY_SEPARATOR.'design';
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($designDir, RecursiveDirectoryIterator::SKIP_DOTS)
        );

        $actualFiles = [];
        /** @var SplFileInfo $file */
        foreach ($iterator as $file) {
            if (! $file->isFile()) {
                continue;
            }

            $relPath = str_replace('\\', '/', substr($file->getPathname(), strlen($root) + 1));
            if ($relPath === 'design/MANIFEST.md') {
                continue;
            }

            $actualFiles[] = $relPath;
            $this->assertArrayHasKey(
                $relPath,
                $manifestMap,
                "File '{$relPath}' in design/ is missing from design/MANIFEST.md."
            );

            $this->assertSame(
                $manifestMap[$relPath]['bytes'],
                $file->getSize(),
                "Byte size mismatch for '{$relPath}'."
            );

            $this->assertSame(
                $manifestMap[$relPath]['sha256'],
                hash_file('sha256', $file->getPathname()),
                "SHA-256 checksum mismatch for '{$relPath}'."
            );
        }

        $this->assertCount(
            count($manifestMap),
            $actualFiles,
            'Number of files in design/ must exactly match design/MANIFEST.md.'
        );
    }

    public function test_commit_msg_hook_rejects_co_authored_by_trailer_and_non_jettythegeek_author(): void
    {
        $root = $this->repoRoot();
        $hookPath = $root.DIRECTORY_SEPARATOR.'.githooks'.DIRECTORY_SEPARATOR.'commit-msg';
        $this->assertFileExists($hookPath);

        $shBinary = is_file('C:/Program Files/Git/bin/sh.exe')
            ? 'C:/Program Files/Git/bin/sh.exe'
            : 'sh';

        $fixtureWithTrailer = tempnam(sys_get_temp_dir(), 'tp_msg_trailer_');
        $fixtureClean = tempnam(sys_get_temp_dir(), 'tp_msg_clean_');
        $this->assertIsString($fixtureWithTrailer);
        $this->assertIsString($fixtureClean);

        try {
            file_put_contents(
                $fixtureWithTrailer,
                "M0.2 test fixture commit\n\nCo-authored-by: Bot <bot@example.com>\n"
            );
            file_put_contents(
                $fixtureClean,
                "M0.2 valid commit message\n"
            );

            $baseEnv = [
                'GIT_AUTHOR_NAME' => 'jettythegeek',
                'GIT_AUTHOR_EMAIL' => 'jettythegeek@users.noreply.github.com',
                'GIT_COMMITTER_NAME' => 'jettythegeek',
                'GIT_COMMITTER_EMAIL' => 'jettythegeek@users.noreply.github.com',
            ];

            // 1. Rejects Co-authored-by trailer
            $trailerProcess = new Process([$shBinary, $hookPath, $fixtureWithTrailer], $root, $baseEnv);
            $trailerProcess->run();
            $this->assertNotSame(0, $trailerProcess->getExitCode(), 'Hook must reject Co-authored-by trailer.');

            // 2. Rejects non-jettythegeek author
            $badAuthorEnv = array_merge($baseEnv, [
                'GIT_AUTHOR_NAME' => 'Cursor Agent',
                'GIT_AUTHOR_EMAIL' => 'cursoragent@cursor.com',
            ]);
            $badAuthorProcess = new Process([$shBinary, $hookPath, $fixtureClean], $root, $badAuthorEnv);
            $badAuthorProcess->run();
            $this->assertNotSame(0, $badAuthorProcess->getExitCode(), 'Hook must reject non-jettythegeek author.');

            // 2b. Rejects non-exact email even if it contains jettythegeek
            $badEmailEnv = array_merge($baseEnv, [
                'GIT_AUTHOR_EMAIL' => 'jettythegeek@example.com',
            ]);
            $badEmailProcess = new Process([$shBinary, $hookPath, $fixtureClean], $root, $badEmailEnv);
            $badEmailProcess->run();
            $this->assertNotSame(0, $badEmailProcess->getExitCode(), 'Hook must require exact jettythegeek@users.noreply.github.com email.');

            // 3. Accepts clean jettythegeek commit
            $cleanProcess = new Process([$shBinary, $hookPath, $fixtureClean], $root, $baseEnv);
            $cleanProcess->run();
            $this->assertSame(0, $cleanProcess->getExitCode(), 'Hook must accept valid jettythegeek commit.');
        } finally {
            @unlink($fixtureWithTrailer);
            @unlink($fixtureClean);
        }
    }
}
