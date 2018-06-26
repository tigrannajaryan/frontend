# How many days of price calculation to perform at once
PRICE_BLOCK_SIZE = 14

# When interpolating the discount based on the demand the
# final discount percentage is granularized to avoid prices
# from being too sensittive to small demand deviations
# Since the normalized demand values are in [0..1] range the
# 0.25 granularization value results in only 4 possible
# values for final calculated discount. This value can be set
# to anything that fits a whole number of times between 0 and 1,
# possible reasonable value are likely around 0.1, 0.2, 0.25.
DISCOUNT_GRANULARIZATION = 0.25

assert round(1 / DISCOUNT_GRANULARIZATION) == 1 / DISCOUNT_GRANULARIZATION

# For a day which is not available for booking (because it is either fully
# occupied, or is not available for booking at all, we will consider demand
# value equal to 1 (demain is 0..1, 1 is completely booked)

COMPLETELY_BOOKED_DEMAND = 1
UNAVAILABLE_DEMAND = 1
