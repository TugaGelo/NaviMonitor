# ---------------------------------------------------
# STAGE 1: The Runtime Environment (The "Dining Room")
# ---------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

# ---------------------------------------------------
# STAGE 2: The Build Environment (The "Kitchen")
# ---------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy only the project file first to cache the downloads
COPY ["NaviMonitor.Api.csproj", "."]
RUN dotnet restore "./NaviMonitor.Api.csproj"

# Copy the rest of your code and compile it
COPY . .
WORKDIR "/src/."
RUN dotnet build "NaviMonitor.Api.csproj" -c Release -o /app/build

# ---------------------------------------------------
# STAGE 3: Publish (Plating the Food)
# ---------------------------------------------------
FROM build AS publish
RUN dotnet publish "NaviMonitor.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---------------------------------------------------
# STAGE 4: Final Output (Serving the App)
# ---------------------------------------------------
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "NaviMonitor.Api.dll"]
