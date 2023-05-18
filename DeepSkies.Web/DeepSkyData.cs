using DeepSkies.Model;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DeepSkies.Web
{
    public static class DeepSkyData
    {
        public static IEndpointRouteBuilder MapDeepSkyData(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/types", GetTypesAsync);
            endpoints.MapGet("/telescopes", GetTelescopesAsync);
            endpoints.MapGet("target/{folder}", GetTargetAsync);          
                        
            endpoints.MapGet("/targets/{type}/{telescope}/{limit:int}/{page:int}",
                async (DeepSkyContext ctx,
                string type,
                string telescope,
                int limit,
                int page,
                [FromQuery] string? sort,
                [FromQuery] bool? descending) =>
                {
                    if (limit < 1)
                    {
                        return Results.BadRequest("Limit is required and must be greater than 0.");
                    }

                    string sortField = sort ?? "date";
                    bool sortDescending = descending ?? sort == null;
                    return await ctx.GetExhibitsAsync(type, limit, page, telescope, sortField, sortDescending);
                });

            return endpoints;
        }

        private async static Task<Ok<string[]>> GetTypesAsync(DeepSkyContext ctx)
            => TypedResults.Ok(
                (await ctx.TargetTypes.OrderBy(t => t.Name).Select(t => t.Name).ToArrayAsync()));

        private async static Task<Ok<string[]>> GetTelescopesAsync(DeepSkyContext ctx)
            => TypedResults.Ok(
                await ctx.Telescopes.OrderBy(t => t.Name).Select(t => t.Name).ToArrayAsync());

        private async static Task<Results<Ok<Exhibit>, NotFound>> GetTargetAsync(
            DeepSkyContext ctx,
            string folder)
        {
            var target = await ctx.Exhibits.FindAsync(folder);
            return target == null 
                ? TypedResults.NotFound() 
                : TypedResults.Ok(target);
        }

        private async static Task<IResult> GetExhibitsAsync(
            this DeepSkyContext ctx,
            string type,
            int limit,
            int page,
            string telescope,
            string sort,
            bool descending)
        {
            IQueryable<Exhibit> targets = ctx.Exhibits;

            if (!string.IsNullOrWhiteSpace(type) && type != "all")
            {
                var targetType = ctx.TargetTypes.FirstOrDefault(t => t.Name == type);

                if (targetType == null)
                {
                    return Results.BadRequest($"'{type}' is not a valid target type. Use the /types endpoint or 'all'.");
                }
                else
                {
                    targets = targets.Where(t => t.Type == type);
                }
            }

            if (!string.IsNullOrWhiteSpace(telescope) && telescope != "all")
            {
                var scope = ctx.Telescopes.FirstOrDefault(t => t.Name == telescope);
                if (scope == null)
                {
                    return Results.Problem($"'{scope}' is not a valid telescope. Use the /telescopes endpoint or 'all'.");
                }
                else
                {
                    targets = targets.Where(t => t.Scope == telescope);
                }
            }

            if (sort == "title")
            {
                if (descending)
                {
                    targets = targets.OrderByDescending(t => t.Title);
                }
                else
                {
                    targets = targets.OrderBy(t => t.Title);
                }
            }
            else if (sort == "date")
            {
                if (descending)
                {
                    targets = targets.OrderByDescending(t => t.LastCapture);
                }
                else
                {
                    targets = targets.OrderBy(t => t.FirstCapture);
                }
            }
            else
            {
                return Results.Problem($"'{sort}' is not a valid sort field. Use 'name' or 'date'.");
            }

            var total = await targets.CountAsync();
            var totalPages = (int)Math.Ceiling((double)total / limit);

            return Results.Ok(new
            {
                TotalExhibits = total,
                CurrentPage = page,
                TotalPages = totalPages,
                Targets =
                await targets
                .Skip(limit * page)
                .Take(limit)
                .Select(t => new
                {
                    t.Title,
                    t.FirstCapture,
                    t.LastCapture,
                    t.Description,
                    t.Type,
                    t.Scope,
                    t.ThumbnailUrl,
                    t.Folder
                })
                .ToArrayAsync()
            });
        }
    }
}
