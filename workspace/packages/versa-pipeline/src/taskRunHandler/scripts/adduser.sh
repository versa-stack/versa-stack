#!/bin/sh

# Define functions to add a system user and group
add_system_user() {
    # Check if the user exists
    if id "$1" >/dev/null 2>&1; then
        echo "User $1 already exists."
        return 1
    fi

    # Check if the "adduser" command exists and is not the Busybox version
    if command -v adduser >/dev/null 2>&1 && ! adduser --help 2>&1 | grep -q BusyBox; then
        # Use the "adduser" command to add the user
        adduser --system --no-create-home --uid "$2" --gid "$3" "$1"
    elif command -v adduser >/dev/null 2>&1; then
        # Use the "adduser" command to add the user (Busybox version)
        adduser -s /bin/false -D -H -u "$2" "$1"
    elif command -v useradd >/dev/null 2>&1; then
        # Use the "useradd" command to add the user
        useradd -r -m -u "$2" -g "$3" "$1"
    else
        # Unable to find either "adduser" or "useradd"
        echo "Unable to add user: neither 'adduser' nor 'useradd' command found"
        return 1
    fi

    echo "User $1 successfully created with UID $2 and GID $3."
}

add_system_group() {
    # Check if the group exists
    if getent group "$1" >/dev/null 2>&1; then
        echo "Group $1 already exists."
        return 1
    fi

    # Check if the "addgroup" command exists and is not the Busybox version
    if command -v addgroup >/dev/null 2>&1 && ! addgroup --help 2>&1 | grep -q BusyBox; then
        # Use the "addgroup" command to add the group
        addgroup --system --gid "$2" "$1"
    elif command -v addgroup >/dev/null 2>&1; then
        # Use the "addgroup" command to add the group (Busybox version)
        addgroup -g "$2" "$1"
    elif command -v groupadd >/dev/null 2>&1; then
        # Use the "groupadd" command to add the group
        groupadd -r -g "$2" "$1"
    else
        # Unable to find either "addgroup" or "groupadd"
        echo "Unable to add group: neither 'addgroup' nor 'groupadd' command found"
        return 1
    fi

    echo "Group $1 successfully created with GID $2."
}

# Call the add_system_group function with the provided arguments
add_system_group "$1" "$2"

# Call the add_system_user function with the provided arguments
add_system_user "$1" "$2" "$2"
