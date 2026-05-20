# Filtering Nutritional Information

## What You'll Build

This is a code-oriented tutorial which allows quickly filtering a large dataset down. It was used to build the [recipe maker](recipe-maker.md) tutorial dataset. You'll have the agent:

1. Write a Python script that reads a CSV file into a Panda's dataframe
2. Convert it to a SQLite database for future reusability
3. Write a SQL query to find common foods with at least 15g of protein
4. Export the results to a CSV

## Setup

### Agents Used

- `Code Writer`

### Prerequisites

- Access to a CLI or IDE agent
- 30-180 minutes of free time
- A version of Python 3 installed
- A folder to hold the data and code files
- Internet access

For the sake of document size, the code environment setup steps have been skipped.

### Setup Steps

1. Download the latest version of the [OpenNutrition dataset](https://www.opennutrition.app/download)
2. Extract the `.tsv` file into the project folder
3. Initialize your agent, Python, and install [pandas](https://pandas.pydata.org/)

## Prompt Priming

Next we'll start priming our prompt in the Llamanomicon. This will help us quickly draft a prompt which can be expanded to match our use cases.

1. Open Llamanomicon
2. Create agents or use the existing `Code Writer` agent
3. Toggle on or off text snippets relevant to this task
4. When your agents are done, save your changes, copy and paste the prompt over to a `prompt.md` file in your project
5. Note: Now is a good time to export your data if you'd like to keep a permanent copy of these agents

## Data Conversion

First, we give the agent a role and briefly explain the project.

```md
You are a senior Python engineer. In this folder is a `prompt.md` which outlines the coding standards you must follow.

You will be writing a data ingestion script to filter down a dataset. The end result is a CSV with the filtered data. To make this process reusable, the initial dataset will be converted into a SQLite database using the pandas library. The dataset is in the folder with the name `opennutrition_foods.csv`. Python and pandas have already been installed.
```

Then, we explain the execution expectations. This could be done as one or two prompts.

```md
This project involves two major steps.

The first step is the data conversion. Create a file called `convert.py` and in that file write a pandas script which does the following:

1. imports the `opennutrition_foods.csv` via Pandas
2. processes the headers
3. then converts the data into a SQLite database named `food.sqlite`
4. ensure the data is properly converted by checking for consistency for the first couple rows

The second stage is filtering.

1. create a script named `filter.py`
2. this script will query the `food.sqlite` database and run a filter against it
3. the filter will use the following filters: `type=everyday` and `protein per 100g >= 15`
4. the result of this query should be saved to a file named `protein_sources.csv`
```

## Analyze the Results

Does the file match the one in the tutorials folder? If so, congratulations! If not, explain what you were expecting and what changes it should make.

## Extra Credit

- Add a step to break apart the nutrition and serving size columns
- Create a nutrition profile and see what combinations of foods fit into that criteria
- Create a search feature which displays the results as a nutrition label
