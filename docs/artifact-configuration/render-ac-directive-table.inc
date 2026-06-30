{% assign table-filter-column = "directive" %}
{% assign table-filter-value = include.directive %}
{% assign table-omit-columns = "directive,isComposite" | split: ',' | append: table-omit-columns  %}
{% assign table-optional-column = "notes" %}

<p><strong>Supported elements:</strong></p>

{% include render-table.html table=site.data.tables.artifact-configuration.signing-file-elements %}

{% assign table-filter-column = nil %}
{% assign table-filter-value = nil %}
{% assign table-omit-columns = nil %}
