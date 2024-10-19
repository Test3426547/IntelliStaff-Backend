{pkgs}: {
  deps = [
    pkgs.docker-compose_1
    pkgs.nvidia-docker
    pkgs.minikube
    pkgs.kubernetes
    pkgs.postgresql
  ];
}
