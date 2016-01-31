#!/usr/bin/env python

import matplotlib.pyplot as plt
import json

d = json.loads(file("res.json").read())
# print d


v = d["parameterValues"]["PRECIPITATION_TOTAL"]
v = map(lambda x: 0 if (x < 0) else x, v)
plt.plot(v)
plt.ylabel('vals')
plt.show()
