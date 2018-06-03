#!/usr/bin/python3.6

import calendar
import configparser
import csv
from datetime import date, timedelta
import json
from random import random
import statistics
import sys
from typing import Dict, List, NamedTuple

CONFIG_FILENAME = "datagen.cfg.json"
OUTPUT_FILENAME = "datagen.csv"


class ServiceDescr(NamedTuple):
    name: str
    visit_avg_interval_days: int
    percent_of_clients_using: int


class InputConfig(NamedTuple):
    stylist_count: int
    clients_per_stylist: int
    days_to_generate: int
    services: List[ServiceDescr]
    weekdays_relative_demand: Dict[int, float]
    avg_weekly_demand: float  # equals to average of weekdays_relative_demand


class Client(NamedTuple):
    name: str
    services: List[ServiceDescr]


class Stylist(NamedTuple):
    name: str
    clients: List[Client]


def exit_error(msg: str):
    print(msg)
    sys.exit(-1)


def read_config() -> InputConfig:
    with open(CONFIG_FILENAME, 'r') as cfgfile:
        config = json.load(cfgfile)
        if not config:
            exit_error(f"Cannot read {CONFIG_FILENAME} in current directory")

    weekdays_relative_demand = {
        list(calendar.day_abbr).index(weekday): float(demand)
        for (weekday, demand) in config['weekdays_relative_demand'].items()
    }

    services = [ServiceDescr(name=svc["name"],
                             visit_avg_interval_days=int(
                                 svc["visit_avg_interval_days"]),
                             percent_of_clients_using=int(
                                 svc['percent_of_clients_using']))
                for svc in config['services']]

    params = InputConfig(
        stylist_count=int(config['stylists']),
        clients_per_stylist=int(config['clients_per_stylist']),
        days_to_generate=int(config['days_to_generate']),
        services=services,
        weekdays_relative_demand=weekdays_relative_demand,
        avg_weekly_demand=statistics.mean(weekdays_relative_demand.values())
    )
    return params


def create_clients(config: InputConfig) -> List[Client]:
    clients: List[Client] = []
    for i in range(1, config.clients_per_stylist+1):
        services: List[ServiceDescr] = []
        for svc in config.services:
            probability = svc.percent_of_clients_using/100.0
            if probability > random():
                services.append(svc)

        client = Client(f"Client#{i}", services)
        clients.append(client)
    return clients


def create_stylists(config: InputConfig) -> List[Stylist]:
    stylists: List[Stylist] = []
    for i in range(1, config.stylist_count+1):
        stylist = Stylist(f"Stylist#{i}", create_clients(config))
        stylists.append(stylist)
    return stylists


def prepare_outfile():
    csvfile = open(OUTPUT_FILENAME, 'w', newline='')
    outfile = csv.writer(csvfile)
    outfile.writerow(['Date', 'Stylist', 'Client', 'Service', 'Weekday'])
    return outfile


def generate_day(stylist: Stylist, day: date, config: InputConfig, outfile) -> None:
    weekday:int = day.weekday()
    demand_coeff = (config.weekdays_relative_demand[weekday] /
                    config.avg_weekly_demand)
    for client in stylist.clients:
        for service in client.services:
            probability = 1.0/service.visit_avg_interval_days
            probability = probability*demand_coeff
            if probability > random():
                outfile.writerow([
                    day.strftime('%Y-%m-%d'),
                    stylist.name,
                    client.name,
                    service.name,
                    calendar.day_name[day.weekday()]])


def generate_data(input_config: InputConfig, stylists: List[Stylist], outfile) -> None:
    for day in range(1, input_config.days_to_generate+1):
        d = date.today() + timedelta(days=(day-input_config.days_to_generate))
        for stylist in stylists:
            generate_day(stylist, d, input_config, outfile)


input_config = read_config()
stylists = create_stylists(input_config)
outfile = prepare_outfile()
generate_data(input_config, stylists, outfile)
