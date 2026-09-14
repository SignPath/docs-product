{%- assign available = site.data.editions | where: include.feature, "true" | map: "name" -%}
{%- assign optional = site.data.editions | where: include.feature, "optional" | map: "name" %}
{%- if optional.size > 0 -%}
  {%- assign optional_qualified = optional | join: " (optional)|" | append: " (optional)" | split: "|" -%}
{%- else -%}
  {%- assign optional_qualified = optional -%}
{%- endif -%}
{%- assign required = site.data.editions | where: include.feature, "required" | map: "name" %}
{%- if required.size > 0 -%}
  {%- assign required_qualified = required | join: " (required)|" | append: " (required)" | split: "|" -%}
{%- else -%}
  {%- assign required_qualified = required -%}
{%- endif -%}
<em>{{ available | concat: optional_qualified | concat: required_qualified | join: ", " }}</em>