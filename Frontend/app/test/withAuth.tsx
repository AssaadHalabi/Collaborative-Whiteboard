"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export const withAuth = (WrappedComponent: any) => {
  const ComponentWithAuth =  (props) => {
    const test = false;
    const router = useRouter();

    useEffect(() => {
      if (!test) {
        router.replace("/login");
      }
    }, [test]);

    if (!test) {
      return null;
    }
    return <WrappedComponent {...props} />;
  }
  ComponentWithAuth.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return ComponentWithAuth;
  };
};
