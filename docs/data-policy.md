# ROOT data policy

Spy Root Universal is designed to inspect ROOT files selected locally by the
user. ROOT data files are not required to build, serve, or test the
application.

## Automated tests

The automated test suite uses simulated ROOT adapters and synthetic metadata.
File names ending in `.root` that appear in the tests are mock values and do
not represent dependencies on binary ROOT files.

## Historical `MB.HIT.root`

An earlier version of this repository contained a file named `MB.HIT.root` in
the repository root.

Audit information for that historical file:

- size: 2,468,643 bytes;
- SHA-256:
  `92d404d4e65b6459838820cc226a7291f642afbac747b6e3be0959acca227bbc`;
- Git blob:
  `1bdec05828f69b036109b7ae05656c550973dae7`;
- distinct historical blobs found during the audit: 1.

No application reference, automated-test dependency, or documented
provenance for this binary was found in the active repository.

The file was therefore removed from the active tree. Git history was not
rewritten, so the historical commit remains part of the repository history.

## Future binary fixtures

A binary ROOT fixture should be committed only when all of the following are
available:

1. a clear test or demonstration requirement;
2. documented provenance and redistribution rights;
3. a minimal file size appropriate to the requirement;
4. preferably, a deterministic script or procedure capable of regenerating
   the fixture;
5. a documented checksum.

Large scientific datasets should instead be distributed through an
appropriate data repository or release asset rather than through the source
tree.

The repository ignores `*.root` by default to prevent accidental commits of
local scientific data.
