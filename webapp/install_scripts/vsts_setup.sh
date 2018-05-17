#!/usr/bin/env bash
set -e
echo "Adding repos"
add-apt-repository --yes 'deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main'
add-apt-repository --yes ppa:deadsnakes/ppa
add-apt-repository ppa:jonathonf/python-3.6
echo "Getting postgres repo key"
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt-get -y update && apt-get -y install locales

echo "Generate locales"
locale-gen en_US.UTF-8
update-locale LANG=en_US.UTF-8
export LANG=en_US.UTF-8

echo "Installing packages"
apt-get install --yes postgresql postgresql-10 python3.6

echo "Starting postgres"
sudo -u postgres /usr/lib/postgresql/10/bin/pg_ctl -D /etc/postgresql/10/main -l /tmp/postgres.log start || true

echo "Setting up pip"
python3.6 -m pip install pip==9.0.1
pip install virtualenv==15.1
