
## Dynamic Data Viz Project
This is the home for the code to build my dynamic data visualization project. For best results, view this on a normal-sized laptop screen.See it deployed [here](https://apelczar.github.io/health_uninsurance/). 

### Data sources
My data came from two major sources.

The percent uninsured over time, by county, and by race are from the Census Bureau's [Small Area Health Insurance Estimates](https://www.census.gov/programs-surveys/sahie.html).

The percent uninsured by income level and by age, and Medicaid expansion status by state, are from the [Kaiser Family Foundation State Health Facts](https://www.kff.org/statedata/).

### Code inspirations
The scrolling part of the page uses the package [Scrollama](https://pudding.cool/process/introducing-scrollama/), and in particular leverages one of the [example code blocks](https://github.com/russellgoldenberg/scrollama/blob/master/docs/sticky-side/index.html).

I modeled some sections after d3 examples created by Mike Bostock, including [interactive line charts](https://observablehq.com/@d3/multi-line-chart), [US county choropleth maps](https://observablehq.com/@d3/choropleth), and [click-to-zoom maps](https://observablehq.com/@d3/zoom-to-bounding-box). I used his function for [color legends](https://observablehq.com/@d3/color-legend) largely as-written.

### Other shout outs
Thanks to Andrew McNutt for his videos on d3 basics, which were particularly useful for the side-by-side bar charts, and his general guidance. And thanks to the Minard group for their feedback and suggestions.