function Version(release)
{
    this.number = release.tag_name;
    this.date = release.published_at;
    this.name = release.name;
    this.description = release.body;
    this.url = release.html_url;
}

function UpdateVersionList(callback)
{
    let repoOwner  = "JohannesMP";
    let repoName   = "NW_CellToxicityDB";
    let apiFormat  = "https://api.github.com/repos/{0}/{1}/{2}";
    let apiRequest = "releases";

    let request = String.format(apiFormat, repoOwner, repoName, apiRequest);

    $.get(request)
        .done(function(data) {
            let versions = []; 
            for(var i = 0; i < data.length; ++i)
            {

                let release = data[i];
                if(release.prerelease == false && release.draft == false)
                    versions.push(new Version(release));
            }
            callback(null, versions);
        })
        .fail(function(err) {
            console.log("Failure on Versions GET: " + request);
            console.log("Error: " + err);
        });
}

let AddVersionEntry = function(list, template, version)
{
    let entry = template.clone();
    entry.find(".version-number").text(version.number);
    let date = new Date(version.date);
    let dateString = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
    entry.find(".version-date").text(dateString);
    entry.find(".version-url").attr("href", version.url);
    entry.find(".version-name").text(version.name);
    list.append(entry);
}
