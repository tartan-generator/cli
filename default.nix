{
  sources ? import ./npins,
  system ? builtins.currentSystem,
  pkgs ?
    import sources.nixpkgs {
      inherit system;
      config = {};
      overlays = [];
    },
}: let
  version = (builtins.fromJSON (builtins.readFile ./package.json)).version;
  dependencyHash = "sha256-hQ0D1n0sj8cd5VguuEMT0S31LFiCZzLChmvTvuekvrM=";
  nodeVersions = ["20" "22" "24"]; # maintained LTS versions
  latestNodeVersion = "nodejs_${pkgs.lib.last nodeVersions}";
  buildOnVersion = nodeVersion:
    pkgs.buildNpmPackage {
      pname = "tartan-cli";
      version = version;
      src = builtins.fetchGit {
        url = ./.;
        shallow = true; # required to work in a github actions runner
      };
      npmDepsHash = dependencyHash;
      nodejs = pkgs."nodejs_${nodeVersion}";
      doCheck = true;
      checkPhase = "node --version; npm test";
    };
in {
  checks = builtins.listToAttrs (map (version: {
      name = "node-v${version}";
      value = buildOnVersion version;
    })
    nodeVersions);

  shell = pkgs.mkShellNoCC {
    packages = with pkgs; [
      pkgs."${latestNodeVersion}"
      npins
      tsx
      (pkgs.writeShellScriptBin "tartan" ''
        DEV_BUILD=1 exec ${pkgs."${latestNodeVersion}"}/bin/npm start -s -- "$@"
      '')
      (pkgs.writeShellScriptBin "update-npm-stuff" ''
        npm i # ensure that package-lock is up to date
        HASH=$(${pkgs.prefetch-npm-deps}/bin/prefetch-npm-deps package-lock.json)
        echo $HASH
        ${pkgs.gnused}/bin/sed -e "s|dependencyHash = \".*\"|dependencyHash = \"$HASH\"|" --in-place=.backup default.nix;
      '')
    ];
  };

  package = buildOnVersion "24"; # latest LTS node version
}
