using DeepSkies.Model;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DeepSkies.Web
{
    public static class DeepSkyPersonalData
    {
        public static IEndpointRouteBuilder MapDeepSkyPersonalData(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet(
                "observation/{folder}", 
                GetLocationLinkAsync)
                .RequireAuthorization();
            
            return endpoints;
        }

        public static async Task<Results<Ok<string>, NotFound>> GetLocationLinkAsync(
            DeepSkyContext ctx,
            ClaimsPrincipal user,
            string folder)
        {
            var target = await ctx.Observatories.Where(o =>
                o.Username == user.Identity!.Name &&
                o.Observation.Folder == folder)
           .Select(o => o.LocationLink).SingleOrDefaultAsync();

            return target == null ? TypedResults.NotFound() : TypedResults.Ok(target);
        }
    }    
}
